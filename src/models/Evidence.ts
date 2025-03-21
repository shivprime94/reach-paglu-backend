import mongoose, { Document, Schema } from 'mongoose';

export interface IEvidence extends Document {
  accountKey: string;
  evidence: string;
  evidenceUrl?: string;
  timestamp: Date;
  reporterId?: string;
}

const evidenceSchema = new Schema<IEvidence>({
  accountKey: { type: String, required: true },
  evidence: { type: String, required: true },
  evidenceUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  reporterId: { type: String }
});

export const Evidence = mongoose.model<IEvidence>('Evidence', evidenceSchema); 