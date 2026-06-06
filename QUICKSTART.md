# TradespaceAi - Installation & Persistent Run Guide

## 🎯 One-Click Startup

### Windows Users:
**Double-click one of these files:**
1. `START.bat` - Traditional batch file
2. `START.ps1` - PowerShell (colorful output)

Both will:
- ✓ Install all dependencies (if not already installed)
- ✓ Start the backend server (port 3001)
- ✓ Start the frontend dev server (port 5173)
- ✓ Keep running until you close the window

### macOS/Linux Users:
```bash
chmod +x START.sh
./START.sh
```

Or from the project folder:
```bash
npm install
npm run dev
```

---

## 📱 Access the App

Once running, open in your browser:

**Local Access (Same Computer):**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

**Network Access (Phone/Other Devices on Same WiFi):**
1. Get your computer's IP:
   - Windows: `ipconfig` → IPv4 Address
   - Mac/Linux: `ifconfig` → inet address

2. Open in any browser: `http://YOUR-IP:5173`

Example: `http://192.168.1.100:5173`

---

## 🔄 Files That Keep Everything Running

| File | Purpose | How to Use |
|------|---------|-----------|
| `START.bat` | Windows launcher | Double-click |
| `START.ps1` | PowerShell launcher | Right-click → Run with PowerShell |
| `package.json` | Root npm scripts | `npm run dev` |
| `server/package.json` | Backend config | Auto-runs via npm |
| `client/package.json` | Frontend config | Auto-runs via npm |

---

## 💾 Persistent Data

Your data is automatically saved:
- **Trades & Portfolio**: `server/data/store.json`
- **Charts & Analytics**: Cached in browser storage
- **User Sessions**: Managed by auth store

---

## 🛠️ What's Already Set Up

✅ **Backend (Express):**
- Listens on all network interfaces (0.0.0.0:3001)
- CORS enabled for development
- Real-time WebSocket updates
- Auto-restart on code changes

✅ **Frontend (React + Vite):**
- Listens on all network interfaces (0.0.0.0:5173)
- Hot Module Reloading (HMR)
- Production build in `client/dist/`
- Mobile responsive design

✅ **Configuration:**
- `.env.local` - Environment variables
- `.gitignore` - Git exclusions
- `DEPLOYMENT.md` - Production guide

---

## 🚀 Development vs Production

### Development (Default)
```bash
npm run dev
```
- Auto-reload on file changes
- Detailed error messages
- Development database

### Production Build
```bash
npm run build           # Build frontend
npm run start          # Start backend only
```
- Optimized bundle in `client/dist/`
- Minified assets
- Production-ready

---

## ⚠️ Troubleshooting

**App won't start?**
- Make sure Node.js is installed: `node --version`
- Try: `npm install` then `npm run dev`

**Can't access from phone?**
- Confirm both devices on same WiFi
- Use correct IP: `ipconfig` (Windows)
- Check firewall allows port 3001 & 5173

**Port already in use?**
- Quit other Node.js processes
- Or change port: `PORT=3002 npm run dev`

**Changes not showing?**
- Client auto-reloads (check browser console)
- Backend needs manual restart on server changes

---

## 📂 Project Structure

```
TradespaceAi/
├── START.bat                 ← Click to run!
├── START.ps1                 ← Or use this
├── package.json              ← Root config
├── README.md                 ← Overview
├── DEPLOYMENT.md             ← Advanced setup
├── .env.local                ← Environment
├── .gitignore                ← Git config
│
├── client/                   ← React Frontend
│   ├── dist/                 ← Production build
│   ├── src/                  ← Source code
│   ├── public/               ← Static assets
│   └── package.json
│
└── server/                   ← Express Backend
    ├── src/
    │   ├── index.js          ← Server entry
    │   ├── routes/           ← API endpoints
    │   ├── engine/           ← Trading logic
    │   └── ...
    ├── data/
    │   └── store.json        ← Persistent data
    └── package.json
```

---

## 🎉 You're All Set!

Everything is saved and configured. Just:

1. **Double-click** `START.bat` (or `START.ps1`)
2. **Wait** for servers to start (~10 seconds)
3. **Open browser** to `http://localhost:5173`
4. **Trade!** 📈

The app will keep running and reload automatically on changes. Enjoy! 🚀
