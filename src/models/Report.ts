import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  accountKey: string;
  platform: string;
  accountId: string;
  votes: number;
  lastReported: Date;
}

const reportSchema = new Schema<IReport>({
  accountKey: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  accountId: { type: String, required: true },
  votes: { type: Number, default: 0 },
  lastReported: { type: Date, default: Date.now }
});

export const Report = mongoose.model<IReport>('Report', reportSchema); 