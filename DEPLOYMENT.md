# TradespaceAi - Production Configuration

## Environment Variables

```bash
# Server (.env or server/.env)
NODE_ENV=production
PORT=3001
CLIENT_ORIGIN=true

# Client (.env.local in client folder)
VITE_API_URL=http://10.125.112.163:3001
VITE_WS_URL=
```

## Quick Start Files

### Windows Users:

**Option 1: Click to Run**
- Double-click `START.bat` to launch the application

**Option 2: PowerShell**
```powershell
.\START.ps1
```

### Mac/Linux Users:

Create a `START.sh` file (already provided in instructions)

## Network Access

The app runs on:
- **Backend**: http://YOUR-IP:3001
- **Frontend**: http://YOUR-IP:5173

Find your IP:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

## Directory Structure After Setup

```
TradespaceAi/
├── client/                  # React App
│   ├── src/                 # Source code
│   ├── dist/                # Production build
│   ├── package.json
│   └── node_modules/
├── server/                  # Express Server
│   ├── src/
│   ├── data/                # Persistent data
│   ├── package.json
│   └── node_modules/
├── START.bat                # Windows batch launcher
├── START.ps1                # PowerShell launcher
├── package.json             # Root scripts
├── .env.local               # Environment config
├── .gitignore               # Git ignore rules
└── README.md                # Documentation
```

## Files That Run All the Time

1. **START.bat** - Windows batch script
   - Auto-checks and installs dependencies
   - Starts both servers
   - Stays running until you close it

2. **START.ps1** - PowerShell script
   - Same as above with color output
   - Run: `.\START.ps1`

3. **npm run dev** - Node.js concurrent runner
   - Configured in root `package.json`
   - Restarts automatically on file changes (dev mode)

## Production Deployment

For production builds:

```bash
# Build client
cd client
npm run build
cd ..

# Run server only
cd server
NODE_ENV=production npm start
```

## Troubleshooting

**Port 3001 already in use:**
```bash
NODE_ENV=production PORT=3002 npm start
```

**Permission denied on START.ps1:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Client can't reach server:**
- Verify server is running on correct IP
- Check firewall allows port 3001
- Use `ipconfig` to find correct network IP

---

Everything is saved and configured for permanent operation! 🚀
