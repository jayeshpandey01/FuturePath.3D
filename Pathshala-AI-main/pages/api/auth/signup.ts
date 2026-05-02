import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password, imageUrl } = req.body;

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    }));

    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    console.error('Signup API error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}