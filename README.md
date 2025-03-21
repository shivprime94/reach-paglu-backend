# ReachPaglu Backend API

Backend server for the ReachPaglu browser extension that provides crowdsourced scam detection functionality.

🔗 [GitHub Repository](https://github.com/shivprime94/reach-paglu-backend)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install and start Redis (required for caching):
   - **macOS**: `brew install redis && brew services start redis`
   - **Linux**: `sudo apt install redis-server && sudo systemctl start redis-server`
   - **Windows**: Download from [Redis releases](https://github.com/tporadowski/redis/releases)

3. Create a `.env` file with the following variables:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
REPORT_THRESHOLD=10
CORS_ORIGIN=*
REDIS_URI=redis://localhost:6379
CACHE_TTL=3600
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Check Account Status
`GET /check/:platform/:accountId`

Check if an account has been reported as a scammer.

- Params:
  - `platform`: "twitter" or "linkedin"
  - `accountId`: Username/ID of the account

Response:
```json
{
  "status": "safe|scammer",
  "votes": number
}
```

### Submit Report
`POST /report`

Submit a new scam report for an account.

- Body:
```json
{
  "platform": "twitter|linkedin",
  "accountId": "string",
  "evidence": "string",
  "evidenceUrl": "string (optional)",
  "reporterToken": "string"
}
```

Response:
```json
{
  "success": true,
  "status": "safe|scammer",
  "votes": number
}
```

### Get Evidence
`GET /evidence/:platform/:accountId`

Get all evidence submitted for an account.

- Params:
  - `platform`: "twitter" or "linkedin"
  - `accountId`: Username/ID of the account

Response:
```json
[
  {
    "evidence": "string",
    "evidenceUrl": "string",
    "timestamp": "date"
  }
]
```

### Get Statistics
`GET /stats`

Get system-wide statistics.

Response:
```json
{
  "scammerCount": number,
  "reportCount": number,
  "accountCount": number
}
```

## Models

### Report
- `accountKey`: Unique identifier (platform:accountId)
- `platform`: Platform name
- `accountId`: Account identifier/username
- `votes`: Number of reports
- `lastReported`: Date of last report

### Evidence
- `accountKey`: Reference to reported account
- `evidence`: Text description of scam evidence
- `evidenceUrl`: Optional URL to evidence
- `timestamp`: When evidence was submitted
- `reporterId`: Anonymous reporter ID

### Reporter
- `reporterId`: Unique reporter identifier
- `reportedAccounts`: List of accounts reported by this reporter

## Security

- IP-based rate limiting
- Duplicate report prevention
- Anonymous reporting
- No personal data storage
- HTTPS required
- Data validation and sanitization

## Tech Stack

- Node.js
- Express
- MongoDB Atlas
- CORS enabled
- Environment variables
- Error handling middleware

## Contributing

1. Fork the repository 
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

The API is deployed on Render.com. Deployment happens automatically when pushing to the main branch.

Production URL: `https://reach-paglu-backend.onrender.com`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port number | 3000 |
| MONGO_URI | MongoDB connection string | required |
| REPORT_THRESHOLD | Reports needed to flag account | 10 |
| CORS_ORIGIN | Allowed CORS origins | * |
| REDIS_URI | Redis connection string | redis://localhost:6379 |
| CACHE_TTL | Cache time-to-live in seconds | 3600 |

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contact

Project Link: [https://github.com/shivprime94/reach-paglu-backend](https://github.com/shivprime94/reach-paglu-backend)
