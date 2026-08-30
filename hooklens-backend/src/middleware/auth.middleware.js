import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-hooklens-key'];

    // 1. Handle API Key Authentication via X-HookLens-Key header or Bearer hk_live_ / hk_test_
    let keyToken = apiKeyHeader;
    if (!keyToken && authHeader && (authHeader.startsWith('Bearer hk_live_') || authHeader.startsWith('Bearer hk_test_'))) {
      keyToken = authHeader.split(' ')[1];
    }

    if (keyToken) {
      const keyHash = crypto.createHash('sha256').update(keyToken.trim()).digest('hex');
      const apiKeyRecord = await ApiKey.findOne({ keyHash, status: 'Active' });

      if (!apiKeyRecord) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid or revoked API key',
        });
      }

      // Update lastUsedAt timestamp asynchronously
      ApiKey.updateOne({ _id: apiKeyRecord._id }, { $set: { lastUsedAt: new Date() } }).exec().catch(() => {});

      const user = await User.findById(apiKeyRecord.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User associated with API key no longer exists',
        });
      }

      req.user = {
        id: user._id.toString(),
        tenantId: user.tenantId.toString(),
        name: user.name,
        email: user.email,
        apiKeyId: apiKeyRecord._id.toString(),
      };

      return next();
    }

    // 2. Handle Standard JWT Bearer Authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication token or API key is required',
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'hooklens_jwt_super_secret_key_prod_2026';

    const decoded = jwt.verify(token, jwtSecret);

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token payload',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User no longer exists',
      });
    }

    // Attach authenticated user and tenant context to req.user
    req.user = {
      id: user._id.toString(),
      tenantId: user.tenantId.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid authentication credential',
    });
  }
};

export default requireAuth;
