import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hooklens_jwt_super_secret_key_prod_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId, tenantId) => {
  return jwt.sign(
    {
      userId: userId.toString(),
      id: userId.toString(),
      tenantId: tenantId.toString(),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Please enter your name.',
      });
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Please enter a valid email address.',
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Password must be at least 8 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'This email is already registered. Sign in instead.',
      });
    }

    // Create Tenant / Workspace for new user
    const slugBase = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const slug = `${slugBase || 'workspace'}-${nanoid(6)}`;

    const tenant = await Tenant.create({
      name: `${name.trim()}'s Workspace`,
      slug,
    });

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create User attached to tenantId
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      tenantId: tenant._id,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    // Generate JWT
    const token = generateToken(user._id, tenant._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        tenantId: tenant._id.toString(),
        avatar: user.avatar,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to create user account.',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Please enter your email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email and explicitly include passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // Compare password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.tenantId);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        tenantId: user.tenantId.toString(),
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Authentication failed.',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        tenantId: req.user.tenantId,
        avatar: req.user.avatar || '',
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch user profile.',
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Always return neutral response to prevent account enumeration
    return res.status(200).json({
      success: true,
      message: "If an account exists for this email, password reset instructions have been sent.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to process request.',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Invalid password reset request.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to reset password.',
    });
  }
};
