import crypto from 'crypto';
import ApiKey from '../models/ApiKey.js';

export const createApiKey = async (req, res) => {
  try {
    const { name, type } = req.body;
    const tenantId = req.user.tenantId;
    const userId = req.user._id || req.user.userId || req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'API Key name is required',
      });
    }

    const keyType = type === 'Test' ? 'Test' : 'Live';
    const prefix = keyType === 'Live' ? 'hk_live_' : 'hk_test_';
    
    // Generate 32 bytes cryptographically secure random token
    const randomSecret = crypto.randomBytes(18).toString('hex');
    const rawFullKey = `${prefix}${randomSecret}`;
    const keyPrefixDisplay = `${prefix}${randomSecret.substring(0, 4)}`;

    // Hash secret using SHA-256 for secure DB storage
    const keyHash = crypto.createHash('sha256').update(rawFullKey).digest('hex');

    const apiKeyRecord = await ApiKey.create({
      tenantId,
      userId,
      name: name.trim(),
      prefix: keyPrefixDisplay,
      keyHash,
      type: keyType,
      status: 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'API Key created successfully',
      rawFullKey, // Revealed ONLY ONCE on creation
      data: {
        _id: apiKeyRecord._id,
        id: apiKeyRecord._id,
        name: apiKeyRecord.name,
        prefix: apiKeyRecord.prefix,
        type: apiKeyRecord.type,
        status: apiKeyRecord.status,
        createdAt: apiKeyRecord.createdAt,
        lastUsedAt: apiKeyRecord.lastUsedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message,
    });
  }
};

export const getApiKeys = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const keys = await ApiKey.find({ tenantId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: keys.length,
      data: keys.map((k) => ({
        _id: k._id,
        id: k._id,
        name: k.name,
        prefix: k.prefix,
        type: k.type,
        status: k.status,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message,
    });
  }
};

export const revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const key = await ApiKey.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { status: 'Revoked' } },
      { new: true }
    );

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'API Key not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'API Key revoked successfully',
      data: {
        _id: key._id,
        status: key.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: error.message,
    });
  }
};
