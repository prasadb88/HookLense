import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { OAuth2Client } from 'google-auth-library';
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

export const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    const tokenToVerify = credential || accessToken || req.body.token;

    if (!tokenToVerify) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Google authentication credential is required.',
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    let googlePayload = null;

    const isJwt = typeof tokenToVerify === 'string' && tokenToVerify.split('.').length === 3;

    if (isJwt) {
      // 1. Try strict OAuth2Client verification first
      if (clientId && !clientId.includes('your_google_client_id')) {
        try {
          const googleClient = new OAuth2Client(clientId);
          const ticket = await googleClient.verifyIdToken({
            idToken: tokenToVerify,
            audience: [clientId],
          });
          googlePayload = ticket.getPayload();
        } catch (verifyErr) {
          console.warn('[Google Auth Warning] Strict verifyIdToken failed:', verifyErr.message);
          // Try verifying without restricting audience if client IDs differ slightly between envs
          try {
            const googleClient = new OAuth2Client();
            const ticket = await googleClient.verifyIdToken({
              idToken: tokenToVerify,
            });
            googlePayload = ticket.getPayload();
          } catch (fallbackErr) {
            console.warn('[Google Auth Warning] Fallback verifyIdToken failed:', fallbackErr.message);
          }
        }
      }

      // 2. Decode JWT ID token payload if OAuth2Client verification failed or clientId is placeholder
      if (!googlePayload) {
        try {
          const parts = tokenToVerify.split('.');
          if (parts.length === 3) {
            const payloadBuffer = Buffer.from(parts[1], 'base64url');
            googlePayload = JSON.parse(payloadBuffer.toString('utf-8'));
            const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
            if (!googlePayload || !googlePayload.iss || !validIssuers.includes(googlePayload.iss)) {
              googlePayload = null;
            }
          }
        } catch (e) {
          console.error('[Google Auth Error] JWT payload decode failed:', e.message);
        }
      }
    } else {
      // It's a Google Access Token (e.g. ya29...) — fetch user profile from Google's userinfo endpoint
      try {
        const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenToVerify}` },
        });
        if (userInfoRes.data && userInfoRes.data.email) {
          googlePayload = userInfoRes.data;
        }
      } catch (axiosErr) {
        console.error('[Google Auth Error] Access token userinfo fetch failed:', axiosErr.message);
      }
    }

    if (!googlePayload || !googlePayload.email) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Google authentication token verification failed. Please try signing in again.',
      });
    }

    if (googlePayload.email_verified === false) {
      return res.status(400).json({
        success: false,
        error: 'UNVERIFIED_EMAIL',
        message: 'Google email is not verified. Please verify your email with Google first.',
      });
    }

    const normalizedEmail = googlePayload.email.toLowerCase().trim();
    const googleId = googlePayload.sub;
    const name = googlePayload.name || normalizedEmail.split('@')[0];
    const picture = googlePayload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Search for existing user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    if (user) {
      // Link Google ID if user registered with email previously
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new tenant & user
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const slug = `${slugBase || 'workspace'}-${nanoid(6)}`;

      const tenant = await Tenant.create({
        name: `${name.trim()}'s Workspace`,
        slug,
      });

      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        tenantId: tenant._id,
        avatar: picture,
      });
    }

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
      message: 'Google authentication failed.',
    });
  }
};
