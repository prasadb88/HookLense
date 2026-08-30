import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    prefix: {
      type: String,
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    type: {
      type: String,
      enum: ['Live', 'Test'],
      default: 'Live',
    },
    status: {
      type: String,
      enum: ['Active', 'Revoked'],
      default: 'Active',
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ApiKey', apiKeySchema);
