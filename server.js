const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const THRESHOLD = 10; // Number of reports needed to flag as scammer
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Update CORS configuration
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
}));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define MongoDB Schemas
const reportSchema = new mongoose.Schema({
  accountKey: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  accountId: { type: String, required: true },
  votes: { type: Number, default: 0 },
  lastReported: { type: Date, default: Date.now }
});

const evidenceSchema = new mongoose.Schema({
  accountKey: { type: String, required: true },
  evidence: { type: String, required: true },
  evidenceUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  reporterId: { type: String }
});

const reporterSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reportedAccounts: { type: [String], default: [] }
});

// Create models
const Report = mongoose.model('Report', reportSchema);
const Evidence = mongoose.model('Evidence', evidenceSchema);
const Reporter = mongoose.model('Reporter', reporterSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Endpoints

// Check account status
app.get('/check/:platform/:accountId', async (req, res) => {
  const { platform, accountId } = req.params;
  
  // Create account key
  const accountKey = `${platform}:${accountId}`;
  
  try {
    const report = await Report.findOne({ accountKey });
    
    if (report) {
      const votes = report.votes;
      const isScammer = votes >= THRESHOLD;
      
      res.json({
        status: isScammer ? 'scammer' : 'safe',
        votes: votes
      });
    } else {
      res.json({
        status: 'safe',
        votes: 0
      });
    }
  } catch (error) {
    console.error('Error checking account:', error);
    res.status(500).json({ error: 'Failed to check account status' });
  }
});

// Submit a report
app.post('/report', async (req, res) => {
  const { platform, accountId, evidence, evidenceUrl, reporterToken } = req.body;
  
  if (!platform || !accountId || !evidence) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Create account key
  const accountKey = `${platform}:${accountId}`;
  
  // Create reporter identifier (combine IP with token if provided)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const reporterId = reporterToken ? `${ip}:${reporterToken}` : ip;
  
  try {
    // Check if this reporter has already reported this account
    let reporter = await Reporter.findOne({ reporterId });
    
    if (!reporter) {
      reporter = new Reporter({ reporterId, reportedAccounts: [] });
    }
    
    if (reporter.reportedAccounts.includes(accountKey)) {
      return res.status(400).json({ 
        error: 'Duplicate report', 
        message: 'You have already reported this account',
        isDuplicate: true
      });
    }
    
    // Find or create report for this account
    let report = await Report.findOne({ accountKey });
    
    if (!report) {
      report = new Report({
        accountKey,
        platform,
        accountId,
        votes: 0,
        lastReported: new Date()
      });
    }
    
    // Add evidence
    const newEvidence = new Evidence({
      accountKey,
      evidence,
      evidenceUrl: evidenceUrl || null,
      timestamp: new Date(),
      reporterId
    });
    
    await newEvidence.save();
    
    // Increment vote count
    report.votes += 1;
    report.lastReported = new Date();
    await report.save();
    
    // Mark this account as reported by this reporter
    reporter.reportedAccounts.push(accountKey);
    await reporter.save();
    
    // Check if account is now a scammer
    const isScammer = report.votes >= THRESHOLD;
    
    res.json({
      success: true,
      status: isScammer ? 'scammer' : 'safe',
      votes: report.votes
    });
    
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get all evidence for an account (useful for review)
app.get('/evidence/:platform/:accountId', async (req, res) => {
  const { platform, accountId } = req.params;
  
  // Create account key
  const accountKey = `${platform}:${accountId}`;
  
  try {
    const evidenceList = await Evidence.find({ accountKey }).sort({ timestamp: -1 });
    res.json(evidenceList);
  } catch (error) {
    console.error('Error fetching evidence:', error);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

// Get statistics
app.get('/stats', async (req, res) => {
  try {
    const scammerCount = await Report.countDocuments({ votes: { $gte: THRESHOLD } });
    const reports = await Report.find();
    const reportCount = reports.reduce((sum, account) => sum + account.votes, 0);
    const accountCount = await Report.countDocuments();
    
    res.json({
      scammerCount,
      reportCount,
      accountCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Migrate existing data from JSON to MongoDB (optional utility endpoint)
app.get('/migrate-data', async (req, res) => {
  try {
    // Only run migration if database is empty
    const reportCount = await Report.countDocuments();
    if (reportCount > 0) {
      return res.json({ message: 'Database already contains data, migration skipped' });
    }
    
    // Data file paths
    const DATA_DIR = path.join(__dirname, 'data');
    const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
    const EVIDENCE_FILE = path.join(DATA_DIR, 'evidence.json');
    const REPORTERS_FILE = path.join(DATA_DIR, 'reporters.json');
    
    // Migrate reports
    if (fs.existsSync(REPORTS_FILE)) {
      const reportsData = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
      
      for (const [accountKey, reportData] of Object.entries(reportsData)) {
        await Report.create({
          accountKey,
          platform: reportData.platform,
          accountId: reportData.accountId,
          votes: reportData.votes,
          lastReported: reportData.lastReported
        });
      }
    }
    
    // Migrate evidence
    if (fs.existsSync(EVIDENCE_FILE)) {
      const evidenceData = JSON.parse(fs.readFileSync(EVIDENCE_FILE, 'utf8'));
      
      for (const [accountKey, evidenceList] of Object.entries(evidenceData)) {
        for (const item of evidenceList) {
          await Evidence.create({
            accountKey,
            evidence: item.evidence,
            evidenceUrl: item.evidenceUrl,
            timestamp: item.timestamp,
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
          reportedAccounts
        });
      }
    }
    
    res.json({ success: true, message: 'Data migration completed successfully' });
  } catch (error) {
    console.error('Error during data migration:', error);
    res.status(500).json({ error: 'Failed to migrate data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
