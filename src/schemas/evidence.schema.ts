import { z } from 'zod';

export const getEvidenceSchema = z.object({
  platform: z.string().min(1, "required"),
  accountId: z.string().min(1, "required")
}); 