# Deployment Guide

> Production deployment instructions for Viny

## 🚀 Quick Deployment

### Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/your-username/viny.git
cd viny

# Build and start production environment
make build
make start

# Check deployment status
make health
```

**Access your application:**

- Frontend: http://localhost (port 80)
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 🐳 Docker Deployment Options

### 1. Docker Compose Production

The simplest production deployment using Docker Compose:

```bash
# Production deployment
git clone https://github.com/your-username/viny.git
cd viny

# Configure environment (optional)
cp .env.example .env
cp server/.env.example server/.env

# Build and deploy
make build
make start

# Monitor logs
make logs
```

**Features:**

- Multi-stage builds for optimized images
- Nginx reverse proxy with caching
- Persistent data volumes
- Health checks and auto-restart
- Log management

### 2. Separate Container Deployment

Deploy frontend and backend independently:

```bash
# Build images
docker build -t viny-frontend .
docker build -t viny-backend ./server

# Create network
docker network create viny-network

# Start backend
docker run -d \
  --name viny-backend \
  --network viny-network \
  -p 3001:3001 \
  -v viny_data:/app/data \
  -e NODE_ENV=production \
  viny-backend

# Start frontend
docker run -d \
  --name viny-frontend \
  --network viny-network \
  -p 80:80 \
  viny-frontend
```

## ☁️ Cloud Platform Deployment

### Railway (One-Click Deploy)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

**Manual Railway Setup:**

1. **Fork the repository** on GitHub
2. **Connect to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```
3. **Deploy:**
   ```bash
   railway up
   ```

**Railway Configuration:**

```toml
# railway.toml
[build]
builder = "DOCKERFILE"
buildCommand = "make build"

[deploy]
startCommand = "make start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Heroku Container Deploy

```bash
# Install Heroku CLI
# Login to Heroku
heroku login
heroku container:login

# Create app
heroku create your-app-name

# Set stack to container
heroku stack:set container -a your-app-name

# Configure environment
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set PORT=3001 -a your-app-name

# Deploy
git push heroku main

# Scale up
heroku ps:scale web=1 -a your-app-name
```

**Heroku Configuration (heroku.yml):**

```yaml
build:
  docker:
    web: Dockerfile
    backend: ./server/Dockerfile
release:
  image: web
  command:
    - make db:push
run:
  web: make start
```

### DigitalOcean Droplet

```bash
# Create and setup droplet (Ubuntu 22.04)
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone https://github.com/your-username/viny.git
cd viny
make build
make start

# Setup firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# Setup SSL with Let's Encrypt (optional)
# See SSL section below
```

### AWS ECS (Elastic Container Service)

```bash
# Install AWS CLI and ECS CLI
pip install awscli
curl -Lo ecs-cli https://amazon-ecs-cli.s3.amazonaws.com/ecs-cli-linux-amd64-latest
chmod +x ecs-cli && sudo mv ecs-cli /usr/local/bin

# Configure AWS credentials
aws configure

# Create ECS cluster
ecs-cli configure --cluster viny-cluster --region us-east-1
ecs-cli up --keypair your-key-pair --capability-iam --size 1 --instance-type t3.micro

# Deploy
ecs-cli compose --file docker-compose.yml up
```

**ECS Task Definition (ecs-task-definition.json):**

```json
{
  "family": "viny",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "viny-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/viny-backend",
      "portMappings": [{ "containerPort": 3001 }],
      "essential": true
    },
    {
      "name": "viny-frontend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/viny-frontend",
      "portMappings": [{ "containerPort": 80 }],
      "essential": true
    }
  ]
}
```

### Google Cloud Run

```bash
# Install gcloud CLI
# Authenticate
gcloud auth login
gcloud config set project your-project-id

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Build and deploy backend
gcloud builds submit --tag gcr.io/your-project-id/viny-backend ./server
gcloud run deploy viny-backend \
  --image gcr.io/your-project-id/viny-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Build and deploy frontend
gcloud builds submit --tag gcr.io/your-project-id/viny-frontend .
gcloud run deploy viny-frontend \
  --image gcr.io/your-project-id/viny-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend Configuration (server/.env)

```env
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=file:./viny.db

# Security
CORS_ORIGIN=https://yourapp.com
JWT_SECRET=your-super-secret-jwt-key-change-this

# Optional: External Database
# DATABASE_URL=postgresql://user:password@host:port/database

# Optional: File Storage
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_S3_BUCKET=your-bucket-name
```

#### Frontend Configuration (.env)

```env
# API Configuration
VITE_API_BASE_URL=https://yourapp.com/api

# Feature Flags
VITE_ENABLE_PLUGINS=true
VITE_ENABLE_ANALYTICS=false

# Optional: Analytics
# VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
# VITE_SENTRY_DSN=your-sentry-dsn
```

### SSL/TLS Configuration

#### Option 1: Let's Encrypt with Nginx

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Option 2: Traefik Reverse Proxy

```yaml
# docker-compose.prod.yml with Traefik
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    command:
      - '--api.dashboard=true'
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.tlschallenge=true'
      - '--certificatesresolvers.letsencrypt.acme.email=your-email@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
    ports:
      - '80:80'
      - '443:443'
      - '8080:8080'
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock:ro'
      - 'letsencrypt:/letsencrypt'

  frontend:
    build: .
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.frontend.rule=Host(`yourdomain.com`)'
      - 'traefik.http.routers.frontend.entrypoints=websecure'
      - 'traefik.http.routers.frontend.tls.certresolver=letsencrypt'

  backend:
    build: ./server
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.backend.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)'
      - 'traefik.http.routers.backend.entrypoints=websecure'
      - 'traefik.http.routers.backend.tls.certresolver=letsencrypt'

volumes:
  letsencrypt:
```

## 📊 Monitoring & Logging

### Health Monitoring

```bash
# Built-in health checks
curl http://localhost:3001/health

# Docker health status
docker ps --filter "health=healthy"

# Custom monitoring script
#!/bin/bash
# monitor.sh
while true; do
  if ! curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "$(date): Health check failed, restarting..."
    docker-compose restart
  fi
  sleep 30
done
```

### Log Management

```bash
# View logs
make logs

# Follow logs in real-time
make logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Configure log rotation
# Add to docker-compose.yml:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Prometheus Monitoring (Optional)

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

## 🔐 Security Considerations

### Production Security Checklist

- [ ] **Change default passwords and secrets**
- [ ] **Enable HTTPS/SSL encryption**
- [ ] **Configure firewall rules**
- [ ] **Regular security updates**
- [ ] **Backup strategy implemented**
- [ ] **Monitor access logs**
- [ ] **Rate limiting configured**
- [ ] **Input validation enabled**

### Firewall Configuration

```bash
# Ubuntu UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3001   # Block direct backend access
sudo ufw enable

# CentOS/RHEL Firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Nginx Security Headers

```nginx
# /etc/nginx/sites-available/viny
server {
    listen 80;
    server_name yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://frontend:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 💾 Backup & Recovery

### Database Backup

```bash
# Manual backup
make db-backup

# Automated backup script
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec backend cp /app/prisma/viny.db /app/data/backup_$DATE.db

# Keep only last 7 days of backups
find /path/to/backups -name "backup_*.db" -mtime +7 -delete

# Add to crontab for daily backups
# 0 2 * * * /path/to/backup.sh
```

### Full System Backup

```bash
# Backup application data
tar -czf viny-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  .env \
  server/.env \
  /var/lib/docker/volumes/viny_data \
  /var/lib/docker/volumes/viny_db

# Backup to S3 (optional)
aws s3 cp viny-backup-*.tar.gz s3://your-backup-bucket/
```

### Disaster Recovery

```bash
# Complete restoration process
# 1. Setup new server with Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Restore application files
git clone https://github.com/your-username/viny.git
cd viny

# 3. Restore data volumes
tar -xzf viny-backup-YYYYMMDD.tar.gz
docker volume create viny_data
docker volume create viny_db

# 4. Start application
make build
make start

# 5. Verify restoration
make health
```

## 🚀 Performance Optimization

### Production Optimizations

```bash
# Enable gzip compression
# Add to nginx.conf:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
# Add to nginx.conf:
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Database optimizations
# Add to server/.env:
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=5000
```

### Load Balancing (Multiple Instances)

```yaml
# docker-compose.lb.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend1
      - backend2

  backend1:
    build: ./server
    environment:
      - NODE_ENV=production
      - PORT=3001

  backend2:
    build: ./server
    environment:
      - NODE_ENV=production
      - PORT=3001
```

```nginx
# nginx.conf for load balancing
upstream backend_pool {
    server backend1:3001;
    server backend2:3001;
}

server {
    location /api/ {
        proxy_pass http://backend_pool/api/;
    }
}
```

## 🔄 Updates & Maintenance

### Zero-Downtime Updates

```bash
# Blue-Green deployment script
#!/bin/bash
# deploy.sh

# Build new version
git pull origin main
make build

# Start new containers with different names
docker-compose -f docker-compose.yml -p viny-green up -d

# Health check
sleep 30
if curl -f http://localhost:3001/health; then
    # Switch traffic (update load balancer)
    # Stop old containers
    docker-compose -p viny-blue down
    # Rename green to blue
    docker-compose -p viny-green down
    docker-compose -f docker-compose.yml -p viny-blue up -d
    echo "Deployment successful"
else
    # Rollback
    docker-compose -p viny-green down
    echo "Deployment failed, rolled back"
    exit 1
fi
```

### Automated Updates

```bash
# Update script with notifications
#!/bin/bash
# auto-update.sh

cd /path/to/viny
git fetch origin main

if [ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]; then
    echo "Updates available, deploying..."

    # Backup before update
    make db-backup

    # Deploy update
    git pull origin main
    make build
    make restart

    # Verify deployment
    sleep 30
    if make health; then
        echo "Update successful" | mail -s "Viny Updated" admin@yourapp.com
    else
        echo "Update failed" | mail -s "Viny Update Failed" admin@yourapp.com
    fi
fi
```

## 📞 Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check what's using port 80/3001
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3001

# Change ports in docker-compose.yml
ports:
  - "8080:80"    # Frontend on port 8080
  - "3002:3001"  # Backend on port 3002
```

#### Memory Issues

```bash
# Monitor container memory
docker stats

# Add memory limits to docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

#### Database Corruption

```bash
# Backup current database
make db-backup

# Reset and restore from backup
cd server
rm prisma/viny.db
npm run db:push

# Restore from backup if needed
cp /path/to/backup.db prisma/viny.db
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

### Support & Help

- **Documentation**: [GitHub Wiki](https://github.com/your-username/viny/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/viny/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/viny/discussions)
- **Email**: support@yourapp.com

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Code tested and reviewed
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Backup strategy planned
- [ ] Monitoring setup

### Deployment

- [ ] Application deployed successfully
- [ ] Health checks passing
- [ ] SSL/HTTPS working
- [ ] Database migrations applied
- [ ] Static assets loading
- [ ] API endpoints responding

### Post-Deployment

- [ ] Application functionality verified
- [ ] Performance monitoring active
- [ ] Backup system tested
- [ ] Log monitoring configured
- [ ] Update procedures documented
- [ ] Team notified of deployment

---

**🎉 Congratulations!** Your Viny application is now deployed and ready for production use.

For ongoing maintenance and updates, refer to the [Development Guide](DEVELOPMENT.md) and keep your documentation up to date.
