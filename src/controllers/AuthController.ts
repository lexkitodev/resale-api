import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { email, password, marketingEmails } = req.body;

      // Validate email
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          error: 'Valid email is required',
        });
      }

      // Validate password
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,32}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error:
            'Password must be 8-32 characters and include uppercase, lowercase, number and special character',
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email already registered',
        });
      }

      // Create user
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          marketingEmails: !!marketingEmails,
        },
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          marketingEmails: user.marketingEmails,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async signin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid email or password',
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Signed in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          marketingEmails: user.marketingEmails,
        },
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async signout(req: Request, res: Response) {
    try {
      // Since we're using JWT, we don't need to do anything server-side
      // The client will remove the token
      res.json({ message: 'Signed out successfully' });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
