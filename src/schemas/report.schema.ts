import { z } from 'zod';

export const checkAccountSchema = z.object({
  platform: z.string().min(1, "required"),
  accountId: z.string().min(1, "required")
});

export const submitReportSchema = z.object({
  platform: z.string().min(1, "required"),
  accountId: z.string().min(1, "required"),
  evidence: z.string().min(1, "required"),
  evidenceUrl: z.string().url().optional(),
  reporterToken: z.string().optional()
}); 