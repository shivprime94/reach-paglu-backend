import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  accountKey: string;
  platform: string;
  accountId: string;
  votes: number;
  lastReported: Date;
}

const reportSchema = new Schema<IReport>({
  accountKey: { 
    type: String, 
    required: true, 
    unique: true,
    index: true // Index on accountKey for faster lookups
  },
  platform: { 
    type: String, 
    required: true,
    index: true // Index on platform for platform-specific queries
  },
  accountId: { 
    type: String, 
    required: true,
    index: true // Index on accountId for user-specific queries
  },
  votes: { 
    type: Number, 
    default: 0,
    index: true // Index on votes for threshold queries
  },
  lastReported: { 
    type: Date, 
    default: Date.now,
    index: true // Index on timestamp for time-based queries
  }
});

// Compound index for platform + accountId queries
reportSchema.index({ platform: 1, accountId: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);