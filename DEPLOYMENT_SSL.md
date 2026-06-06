# SSL Deployment Guide (Nginx + Let's Encrypt)

This document describes a simple approach to deploy TradespaceAi with TLS using Docker + nginx and Let's Encrypt certificates.

Prerequisites:
- A server with a public IP and domain name pointed to it (e.g. `example.com`).
- Docker and Docker Compose installed on the host.
- Port 80 and 443 reachable from the internet.

Steps (high level):

1. Obtain certificates using Certbot on the host (recommended):

   sudo apt update && sudo apt install certbot
   sudo certbot certonly --standalone -d example.com -d www.example.com

   Certbot will place certs under `/etc/letsencrypt/live/example.com/`.

2. Update docker/nginx.conf

   Replace `YOUR_DOMAIN_HERE` with your domain in `docker/nginx.conf`.

3. Start the app with Docker Compose

   From repository root:

```bash
# build images and start
docker compose -f docker/docker-compose.yml up -d --build
```

4. Mount certificates into the container

   Modify `docker-compose.yml` to mount the host certs into the nginx image if you want nginx inside the client container to serve TLS directly. Example:

```yaml
  client:
    volumes:
      - /etc/letsencrypt/live/example.com/:/etc/letsencrypt/live/example.com/:ro
```

5. Alternatively use a reverse proxy (recommended)

   Use an external reverse-proxy such as Traefik or Nginx Proxy Manager to handle TLS and route traffic to the `client` and `server` containers. These tools automate Let's Encrypt certificate issuance and renewal.

Notes & Security
- Keep `JWT_SECRET` in environment variables or a secrets manager, not checked into git.
- Use `CLIENT_ORIGIN` to restrict allowed origins in production.
- Consider using a process manager for the server (PM2) if running without Docker.

If you want, I can set up a Traefik-based `docker-compose` that automates Let's Encrypt issuance and renewal for you.
