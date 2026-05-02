
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '@/models/User';
import { Roadmap, Node, NodeDependency } from '@/models/Roadmap';
import dbConnect from '@/lib/dbConnect';
import { verify } from 'jsonwebtoken';
import cookie from 'cookie';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getUserFromRequest(req: NextApiRequest) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    await dbConnect();
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    console.error("Error getting user from request:", error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect(); // Ensure DB connection is established

  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { targetRole } = req.body;

  if (!targetRole) {
    return res.status(400).json({ message: 'targetRole is required' });
  }

  const prompt = `
    You are an expert career coach and learning strategist. Based on the following user profile and their target job role, generate a detailed, personalized learning roadmap.

    User Profile:
    - Bio: ${user.bio}
    - Skills: ${user.skills.join(', ')}
    - Industry: ${user.industry}
    - Experience: ${user.experience || 'Not specified'}

    Target Role: ${targetRole}

    Generate a roadmap as a JSON object with two main keys: "nodes" and "dependencies".

    - "nodes": An array of learning modules. Each node should be an object with:
        - "id": A unique integer identifier for the node (e.g., 1, 2, 3).
        - "title": A concise name for the learning module (e.g., "Mastering React Hooks").
        - "details": A detailed, 2-3 sentence description of what the user will learn and why it's important for the target role.
        - "resources": An array of 2-3 high-quality, real-world learning resources (articles, tutorials, documentation). Each resource should be an object with "title" and "url".

    - "dependencies": An array of objects representing the relationships between nodes. Each object should have:
        - "source": The "id" of the node that must be completed first.
        - "target": The "id" of the node that depends on the source.

    Example JSON structure:
    {
      "nodes": [
        {
          "id": 1,
          "title": "Fundamentals of JavaScript",
          "details": "...",
          "resources": [
            { "title": "MDN JavaScript Guide", "url": "..." }
          ]
        },
        {
          "id": 2,
          "title": "Introduction to React",
          "details": "...",
          "resources": []
        }
      ],
      "dependencies": [
        { "source": 1, "target": 2 }
      ]
    }

    Ensure the roadmap is comprehensive, logical, and tailored to the user's profile and goals. The roadmap should contain at least 10 nodes.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.candidates[0].content.parts[0].text;

    const cleanedText = text.replace(/```json|```/g, '').trim();
    const roadmapData = JSON.parse(cleanedText);

    try {
      // 1. Create the Roadmap document
      const newRoadmap = new Roadmap({
        userId: user._id,
        targetRole: targetRole,
      });
      await newRoadmap.save();

      const nodeIdMap = new Map<number, mongoose.Types.ObjectId>();

      // 2. Create Node documents
      for (const nodeData of roadmapData.nodes) {
        const newNode = new Node({
          roadmapId: newRoadmap._id,
          title: nodeData.title,
          details: nodeData.details,
          resources: nodeData.resources,
          // Position can be set later by a layout algorithm
        });
        await newNode.save();
        nodeIdMap.set(nodeData.id, newNode._id);
      }

      // 3. Create NodeDependency documents
      if (roadmapData.dependencies) {
        for (const dep of roadmapData.dependencies) {
          const sourceId = nodeIdMap.get(dep.source);
          const targetId = nodeIdMap.get(dep.target);

          if (sourceId && targetId) {
            const newDependency = new NodeDependency({
              nodeId: targetId,
              dependencyId: sourceId,
            });
            await newDependency.save();
          }
        }
      }

      res.status(201).json({ message: 'Roadmap generated successfully', roadmapId: newRoadmap._id });

    } catch (error) {
      console.error('Failed to save roadmap to DB', error);
      // If saving fails, we should ideally clean up any created documents,
      // but for now, we'll just return an error.
      res.status(500).json({ message: 'Failed to save roadmap' });
    }

  } catch (error) {
    console.error('Failed to generate roadmap from Gemini API', error);
    if (error instanceof Error) {
        console.error(error.stack);
    }
    res.status(500).json({ message: 'Failed to generate roadmap' });
  }
}
