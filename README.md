# TradespaceAi - Complete Setup Guide

A full-stack trading application with real-time market data, portfolio management, and AI-powered strategy recommendations.

## 📁 Project Structure

```
TradespaceAi/
├── client/              # React + Vite frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/              # Express + Socket.io backend
│   ├── src/
│   ├── package.json
│   └── index.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

1. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

### Running the Application

**Option 1: Run Separately (Recommended for Development)**

Terminal 1 - Start Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Start Frontend:
```bash
cd client
npm run dev
```

**Option 2: Run with Root Scripts**

From root TradespaceAi folder:
```bash
npm run install:all   # install root, server, and client dependencies
npm run dev           # runs both server and client in development
```

**Option 3: Run Production Build (single server)**

From root TradespaceAi folder:
```bash
npm run prod
```

On Windows, you can also start it with the launcher:
```bat
RUN_PROD.bat
```

This will build the client and start the Express server, which serves the frontend from `client/dist` and provides the API from the same port.

## Android wrapper packaging

You can wrap the web app as an Android app using Capacitor:

```bash
npm install
npm run android:init
npm run android:add
npm run android:sync
npm run android:open
```

Then open Android Studio from the generated `android` folder, build a signed bundle, and upload the `.aab` to the Google Play Console.

## 🌐 Network Access

The application is configured to run on your local network so you can access it from any device.

### Finding Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```

### Accessing from Different Devices

**Same Network (Computer, Phone, Tablet):**
- Backend: `http://<your-ip>:3001`
- Frontend: `http://<your-ip>:5173`

**Example:**
If your computer's IP is `192.168.1.100`:
- Open browser on phone: `http://192.168.1.100:5173`

**Localhost Only:**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

## 🔧 Environment Configuration

Create a `.env` file in the root or specific folders if needed:

```bash
# Server (.env or server/.env)
NODE_ENV=development
PORT=3001
CLIENT_ORIGIN=true

# Client (.env or client/.env)
VITE_API_URL=http://localhost:3001
VITE_WS_URL=
```

## 📱 Mobile Support

The app is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)

For best experience, use the latest browser version.

## 🛠 Troubleshooting

### Port Already in Use

If ports 3001 or 5173 are already in use:

```bash
# Server (change port)
NODE_ENV=development PORT=3002 npm run dev

# Client (change port in vite.config.ts)
```

### Connection Refused

1. Ensure backend is running: `http://localhost:3001`
2. Check firewall settings - allow Node.js/npm through
3. Verify correct IP address on different devices

### CORS Issues

Ensure `server/src/index.js` has proper CORS configuration:
```javascript
origin: true  // Allow all origins in development
```

## 📖 Features

- **Real-time Market Data** - Live price updates via WebSocket
- **Portfolio Management** - Track trades and positions
- **Technical Analysis** - Advanced charting and indicators
- **Backtesting** - Test strategies on historical data
- **Responsive Design** - Works on all devices
- **User Authentication** - Secure login/signup

## 🎯 Development Workflow

1. Make changes to `client/src` or `server/src`
2. Frontend auto-reloads with Vite HMR
3. Backend requires manual restart (or use nodemon)

## 📦 Build for Production

```bash
cd client
npm run build

# Output in client/dist/
```

Then start the backend. It will automatically serve the built frontend if `client/dist` exists:

```bash
cd server
npm start
```

## 🤝 Support

For issues or questions, check:
- Server logs in terminal 1
- Browser console (F12) for frontend errors
- Network tab for API requests

---

**Happy Trading! 🚀**
