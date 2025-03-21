import mongoose, { Document, Schema } from 'mongoose';

export interface IReporter extends Document {
  reporterId: string;
  reportedAccounts: string[];
}

const reporterSchema = new Schema<IReporter>({
  reporterId: { type: String, required: true },
  reportedAccounts: { type: [String], default: [] }
});

export const Reporter = mongoose.model<IReporter>('Reporter', reporterSchema); 