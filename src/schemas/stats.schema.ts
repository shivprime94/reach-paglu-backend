import { z } from 'zod';

// Stats endpoint doesn't require any parameters, but for consistency, we create an empty schema
export const getStatsSchema = z.object({}); 