# Deployment Guide

## Backend Deployment (Docker)

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database (optional, can use SQLite)

### Steps

1. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Build and Run Backend Container**
   ```bash
   docker-compose up -d --build
   ```

3. **Check Backend Status**
   ```bash
   docker-compose logs -f backend
   ```

4. **Stop Backend**
   ```bash
   docker-compose down
   ```

### Manual Docker Commands (without docker-compose)

```bash
# Build the image
cd backend
docker build -t pdf-tools-backend .

# Run the container
docker run -d \
  --name pdf_tools_backend \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -e DATABASE_URL="sqlite:///./app.db" \
  -e SECRET_KEY="your-secret-key" \
  pdf-tools-backend

# View logs
docker logs -f pdf_tools_backend

# Stop container
docker stop pdf_tools_backend
docker rm pdf_tools_backend
```

## Frontend Deployment (Nginx)

### Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in the `frontend/.next` directory (for Next.js).

### Nginx Configuration (Host Machine)

The backend runs in Docker on `127.0.0.1:9002`. Use your existing nginx on the host machine to proxy requests.

#### Simple Proxy Configuration

Add this to your nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:9002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Alternative: Frontend + Backend Split

If serving frontend separately:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (Next.js build)
    root /var/www/pdftools/frontend/out;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Backend
    location /api {
        proxy_pass http://127.0.0.1:9002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Files endpoint
    location /files {
        proxy_pass http://127.0.0.1:9002;
        proxy_set_header Host $host;
    }
}
```

### Enable Site and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/pdftools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Production Checklist

- [ ] Update `SECRET_KEY` in `.env`
- [ ] Configure proper `DATABASE_URL` (PostgreSQL recommended)
- [ ] Set correct `ALLOWED_ORIGINS` in backend CORS settings
- [ ] Update API endpoint in frontend to point to production domain
- [ ] Enable HTTPS with Let's Encrypt (certbot)
- [ ] Set up automatic backups for database
- [ ] Configure log rotation
- [ ] Set up monitoring (optional)

## Updating Deployment

### Backend Update
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Frontend Update
```bash
cd frontend
git pull
npm install
npm run build
# Copy built files to nginx directory
sudo cp -r out/* /var/www/pdftools/frontend/out/
```

## Troubleshooting

### Backend Container Issues
```bash
# View logs
docker-compose logs -f backend

# Restart container
docker-compose restart backend

# Rebuild from scratch
docker-compose down
docker-compose up -d --build
```

### Frontend API Connection Issues
- Check nginx configuration
- Verify backend is running: `curl http://localhost:9002`
- Check CORS settings in backend
- Verify API endpoint URL in frontend code
