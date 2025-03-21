import { Router } from 'express';
import { migrateData } from '../controllers/migrationController';
import { migrateDataSchema } from '../schemas/migration.schema';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Migrate existing data from JSON to MongoDB
router.get('/migrate-data', 
  validate(migrateDataSchema),
  migrateData
);

export default router; 