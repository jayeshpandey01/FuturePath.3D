
import { NextApiRequest, NextApiResponse } from 'next';
import { Roadmap, Node, NodeDependency, UserNodeProgress } from '@/models/Roadmap';
import dbConnect from '@/lib/dbConnect';
import { verify } from 'jsonwebtoken';
import cookie from 'cookie';
import User from '@/models/User';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect(); // Ensure DB connection is established

  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const roadmap = await Roadmap.findOne({ userId: user._id });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found for this user' });
    }

    const nodes = await Node.find({ roadmapId: roadmap._id });
    const nodeDependencies = await NodeDependency.find({ roadmapId: roadmap._id }); // Assuming NodeDependency also has roadmapId
    const userNodeProgress = await UserNodeProgress.find({ userId: user._id });

    // Map node IDs to their actual Mongoose _id for dependencies
    const nodeIdMap = new Map<mongoose.Types.ObjectId, string>();
    nodes.forEach(node => nodeIdMap.set(node._id, node._id.toString()));

    const formattedNodes = nodes.map(node => ({
      id: node._id.toString(),
      title: node.title,
      details: node.details,
      resources: node.resources,
      position: node.position,
      progress: userNodeProgress.find(p => p.nodeId.equals(node._id))?.status || "not_started",
    }));

    const formattedDependencies = nodeDependencies.map(dep => ({
      source: dep.dependencyId.toString(),
      target: dep.nodeId.toString(),
    }));

    res.status(200).json({
      roadmap: {
        _id: roadmap._id.toString(),
        targetRole: roadmap.targetRole,
        generatedAt: roadmap.generatedAt,
        version: roadmap.version,
      },
      nodes: formattedNodes,
      dependencies: formattedDependencies,
    });

  } catch (error) {
    console.error('Failed to fetch roadmap data', error);
    res.status(500).json({ message: 'Failed to fetch roadmap data' });
  }
}
