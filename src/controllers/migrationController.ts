import { Request, Response } from 'express';

import { Evidence } from '../models/Evidence';
import { Report } from '../models/Report';
import { Reporter } from '../models/Reporter';
import fs from 'fs';
import path from 'path';

export const migrateData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only run migration if database is empty
    const reportCount = await Report.countDocuments();
    if (reportCount > 0) {
      res.json({ message: 'Database already contains data, migration skipped' });
      return;
    }
    
    // Data file paths
    const DATA_DIR = path.join(__dirname, '../../data');
    const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
    const EVIDENCE_FILE = path.join(DATA_DIR, 'evidence.json');
    const REPORTERS_FILE = path.join(DATA_DIR, 'reporters.json');
    
    // Migrate reports
    if (fs.existsSync(REPORTS_FILE)) {
      const reportsData = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
      
      for (const [accountKey, reportData] of Object.entries(reportsData)) {
        const typedReportData = reportData as {
          platform: string;
          accountId: string;
          votes: number;
          lastReported: string;
        };
        
        await Report.create({
          accountKey,
          platform: typedReportData.platform,
          accountId: typedReportData.accountId,
          votes: typedReportData.votes,
          lastReported: new Date(typedReportData.lastReported)
        });
      }
    }
    
    // Migrate evidence
    if (fs.existsSync(EVIDENCE_FILE)) {
      const evidenceData = JSON.parse(fs.readFileSync(EVIDENCE_FILE, 'utf8'));
      
      for (const [accountKey, evidenceList] of Object.entries(evidenceData)) {
        const typedEvidenceList = evidenceList as Array<{
          evidence: string;
          evidenceUrl?: string;
          timestamp: string;
          reporterId?: string;
        }>;
        
        for (const item of typedEvidenceList) {
          await Evidence.create({
            accountKey,
            evidence: item.evidence,
            evidenceUrl: item.evidenceUrl,
            timestamp: new Date(item.timestamp),
            reporterId: item.reporterId
          });
        }
      }
    }
    
    // Migrate reporters
    if (fs.existsSync(REPORTERS_FILE)) {
      const reportersData = JSON.parse(fs.readFileSync(REPORTERS_FILE, 'utf8'));
      
      for (const [reporterId, reportedAccounts] of Object.entries(reportersData)) {
        await Reporter.create({
          reporterId,
          reportedAccounts: reportedAccounts as string[]
        });
      }
    }
    
    res.json({ success: true, message: 'Data migration completed successfully' });
  } catch (error) {
    console.error('Error during data migration:', error);
    res.status(500).json({ error: 'Failed to migrate data' });
  }
}; 