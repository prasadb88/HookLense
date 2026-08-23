import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication token is required',
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

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid authentication token',
    });
  }
};

export default requireAuth;
