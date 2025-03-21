# Deployment Guide

This guide explains how to deploy the ReachPaglu backend to production with Redis caching.

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account
- Redis service (You can use services like Redis Labs, Upstash, or self-host)

## Deployment Options

### Option 1: Render.com (Current Setup)

1. Log in to [Render.com](https://render.com)
2. Create a new Web Service and connect your GitHub repository
3. Set the following configuration:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT`: 3000
     - `MONGO_URI`: Your MongoDB connection string
     - `REPORT_THRESHOLD`: 10
     - `CORS_ORIGIN`: * (or your specific domains)
     - `REDIS_URI`: Your Redis connection string (from Redis Labs, Upstash, etc.)
     - `CACHE_TTL`: 3600

### Option 2: Self-Hosting

1. Install Redis on your server:
   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo systemctl enable redis-server
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/shivprime94/reach-paglu-backend.git
   cd reach-paglu-backend
   ```

3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

4. Create a `.env` file with your configuration

5. Install PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name reachpaglu-backend
   pm2 save
   pm2 startup
   ```

## Cloud Redis Providers

### Upstash Redis
1. Create an account at [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Copy the Redis connection string to your `.env` file or environment variables

### Redis Labs
1. Create an account at [Redis Labs](https://redis.com/)
2. Create a new subscription and database
3. Set up password authentication
4. Use the connection string in your `.env` file

## Monitoring and Maintenance

- Use PM2 or your hosting provider's dashboard to monitor application status
- Set up alerts for high memory usage or errors
- Regularly backup your MongoDB data
