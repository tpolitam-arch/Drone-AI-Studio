# Deployment Guide - Drone AI Studio

This guide covers different deployment options for your Drone AI Studio application.

## Replit Deployment (Recommended)

### Quick Deploy
1. In your Replit project, click the **Deploy** button
2. Choose "Autoscale" for automatic scaling
3. Your app will be available at `https://<project-name>.replit.app`
4. Replit handles HTTPS, scaling, and monitoring automatically

### Custom Domain (Optional)
1. Go to your deployment settings
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificates are handled automatically

## Local Development

### Requirements
- Node.js 18 or higher
- npm 8 or higher

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5000
```

## Production Deployment

### Environment Setup
Create a `.env` file with:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=5000
```

### Build Process
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Cloud Platform Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Your app will be deployed with automatic HTTPS

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify
3. Configure redirects for SPA routing

### Railway
1. Connect your GitHub repository
2. Railway auto-detects Node.js
3. Set environment variables in dashboard
4. Deploy automatically on git push

### Heroku
```bash
# Install Heroku CLI
# Login: heroku login

# Create app
heroku create your-drone-ai-studio

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## Database Configuration

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE droneai;

-- Create user
CREATE USER droneai_user WITH PASSWORD 'your_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE droneai TO droneai_user;
```

### Migration
```bash
# Push schema to database
npm run db:push
```

## SSL/HTTPS Configuration

### Why HTTPS is Required
- Voice recognition APIs require secure context
- Screen sharing APIs require HTTPS
- Modern browsers block media access on HTTP

### Local HTTPS (Development)
```bash
# Install mkcert
brew install mkcert  # macOS
# or
sudo apt install mkcert  # Ubuntu

# Create local certificate
mkcert localhost 127.0.0.1 ::1

# Update vite.config.ts to use HTTPS
```

## Performance Optimization

### Frontend Optimization
- Bundle size is optimized with Vite
- Images are served efficiently
- CSS is purged and minified

### Backend Optimization
- Express.js is lightweight
- Database queries are optimized
- Streaming reduces perceived latency

### Caching Strategy
```nginx
# Nginx configuration example
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Monitoring and Logging

### Health Check Endpoint
The app includes a health check at `/health`

### Error Monitoring
Add error tracking with services like:
- Sentry
- LogRocket
- Datadog

### Performance Monitoring
Monitor key metrics:
- Response times
- Error rates
- User engagement
- Voice/video feature usage

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use secrets management in production
- Rotate API keys regularly

### CORS Configuration
```javascript
// Configured in server/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Rate Limiting
```javascript
// Add to server/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Scaling Considerations

### Horizontal Scaling
- Stateless design allows multiple instances
- Use load balancer for distribution
- Session storage should be external (Redis)

### Database Scaling
- Connection pooling
- Read replicas for queries
- Caching layer (Redis/Memcached)

### CDN Integration
- Serve static assets from CDN
- Cache API responses where appropriate
- Use geographic distribution

## Backup Strategy

### Database Backups
```bash
# Daily automated backup
pg_dump droneai > backup_$(date +%Y%m%d).sql

# Restore from backup
psql droneai < backup_20250714.sql
```

### Code Backups
- Git repository with multiple remotes
- Regular tags for releases
- Automated testing before deployment

## Troubleshooting Deployment

### Common Issues

**Build Failures:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**Database Connection Issues:**
- Verify DATABASE_URL format
- Check firewall settings
- Ensure database is running

**HTTPS/Media Issues:**
- Verify SSL certificate
- Check browser permissions
- Test in incognito mode

**Performance Issues:**
- Enable gzip compression
- Optimize database queries
- Use production builds

### Debug Commands
```bash
# Check logs
npm run logs

# Test API endpoints
curl https://your-app.com/api/health

# Monitor resource usage
top -p $(pgrep node)
```

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor error logs daily
- Backup database weekly
- Review performance metrics

### Security Updates
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update all dependencies
npm update
```

## Support and Resources

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

### Community
- Stack Overflow tags: `express`, `react`, `typescript`
- GitHub Discussions
- Discord communities

---

**Note**: Always test deployments in a staging environment before going to production.