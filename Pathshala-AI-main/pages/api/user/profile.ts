import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { verify } from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    await dbConnect();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { industry, experience, skills, bio, linkedin, github } = req.body;

    user.industry = industry;
    user.experience = experience;
    user.skills = skills;
    user.bio = bio;
    user.linkedin = linkedin;
    user.github = github;

    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
