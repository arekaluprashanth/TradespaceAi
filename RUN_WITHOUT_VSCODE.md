# 🚀 Run TradespaceAi WITHOUT Visual Studio Code

Your app can run independently and continuously, even when VS Code is closed.

---

## ⭐ BEST OPTIONS

### Option 1: Run in Background (Recommended)

**Double-click:** `RUN_BACKGROUND.bat`

This will:
- ✅ Start backend server in separate terminal
- ✅ Start frontend app in separate terminal  
- ✅ Let you close this launcher window
- ✅ **Services keep running in background**
- ✅ Services continue even after VS Code closes
- ✅ You can close the launcher window - servers stay running

**To stop servers:** Close the two terminal windows (Backend & Frontend)

---

### Option 2: Always-On 24/7 Service

**Double-click:** `RUN_ALWAYS_ON.bat`

This will:
- ✅ Run services continuously
- ✅ Auto-restart if servers crash
- ✅ Restart every 24 hours automatically
- ✅ Run in background, minimized windows
- ✅ Perfect for leaving running on your PC
- ✅ **Never stops - true 24/7 operation**

**To stop servers:** Close all terminals with "TradespaceAi" in the title

---

### Option 3: Auto-Start with Computer

**Double-click:** `CREATE_SHORTCUTS.bat`

This will:
- ✅ Create desktop shortcut (easy access)
- ✅ Add to Windows Startup folder
- ✅ **App automatically starts when you turn on computer**
- ✅ Runs in background
- ✅ Never need to manually start again

**To use:** Restart your computer - app will start automatically

---

## 📊 COMPARISON TABLE

| Feature | RUN_BACKGROUND.bat | RUN_ALWAYS_ON.bat | Auto-Startup |
|---------|-------------------|-------------------|--------------|
| Runs in background | ✅ Yes | ✅ Yes | ✅ Yes |
| Can close launcher | ✅ Yes | ✅ Yes | ✅ Yes |
| Works after VS closes | ✅ Yes | ✅ Yes | ✅ Yes |
| Auto-restart if crash | ❌ No | ✅ Yes | ✅ (on reboot) |
| Starts on computer boot | ❌ No | ❌ No | ✅ Yes |
| Shows terminal windows | ✅ 2 windows | ✅ Minimized | ✅ Minimized |
| Best for | Testing | 24/7 server | Always-on PC |

---

## 🎯 QUICK START

### Just Want to Test Without VS Code?
```bash
Double-click: RUN_BACKGROUND.bat
```
✅ Services run in background
✅ Close launcher window - servers keep running
✅ Open `http://localhost:5173` in browser

### Want Services Always Running?
```bash
Double-click: RUN_ALWAYS_ON.bat
```
✅ Runs 24/7 with auto-restart
✅ Minimized terminals
✅ Perfect for dedicated server PC

### Want Auto-Start on Computer Boot?
```bash
Double-click: CREATE_SHORTCUTS.bat
```
✅ Creates desktop shortcut
✅ Adds to Windows Startup
✅ App starts automatically on restart

---

## 📂 AVAILABLE LAUNCHERS

| File | Purpose | Terminal Stays Open |
|------|---------|-------------------|
| `RUN_WINDOWS.bat` | Single window launcher | ✅ Yes |
| `RUN_BACKGROUND.bat` | **Background service** | ❌ No |
| `RUN_ALWAYS_ON.bat` | 24/7 service | ❌ No |
| `START.bat` | Alternative launcher | ✅ Yes |
| `START_WINDOWS.bat` | Batch launcher | ✅ Yes |
| `CREATE_SHORTCUTS.bat` | Auto-startup creator | ❌ (creates shortcuts) |

---

## ✅ HOW IT WORKS

### RUN_BACKGROUND.bat Process:

1. **Launcher Starts**
   - Checks Node.js installed
   - Installs dependencies if needed
   
2. **Services Launch**
   - Backend starts in Terminal #1
   - Frontend starts in Terminal #2
   - Launcher window closes
   
3. **Services Run in Background**
   - You can close VS Code ✅
   - You can close launcher ✅
   - Services keep running ✅
   
4. **Access the App**
   - Open browser: `http://localhost:5173`
   - App works normally
   
5. **Stop Services**
   - Close Backend terminal window
   - Close Frontend terminal window
   - Both services stop

---

## 🛑 STOPPING THE SERVICES

**If using RUN_BACKGROUND.bat:**
- Close the "TradespaceAi - Backend Server" window
- Close the "TradespaceAi - Frontend App" window

**If using RUN_ALWAYS_ON.bat:**
- Press Ctrl+C in the main window
- Or close all terminals with "TradespaceAi" in title

**To completely stop:**
```bash
taskkill /IM node.exe
```

---

## 💾 DATA PERSISTENCE

Your data is automatically saved:
- ✅ Trades saved to `server/data/store.json`
- ✅ Portfolio data saved locally
- ✅ Survives server restarts
- ✅ Survives VS Code closing
- ✅ Only lost if you delete files

---

## 🌐 ACCESS ANYWHERE

Once running in background:

**Same Computer:**
```
http://localhost:5173
```

**Other Device on WiFi:**
```
http://192.168.1.100:5173
(replace IP with your computer's IP)
```

**Get Your IP:**
```bash
ipconfig
(look for IPv4 Address)
```

---

## 🚀 RECOMMENDED SETUP

For best experience, use this workflow:

1. **First Time:**
   - Double-click `RUN_BACKGROUND.bat`
   - Wait for both servers to start
   - Verify app works in browser

2. **For Regular Use:**
   - Double-click `CREATE_SHORTCUTS.bat`
   - App will now auto-start with Windows
   - No need to manually start anymore

3. **For 24/7 Trading:**
   - Double-click `RUN_ALWAYS_ON.bat`
   - Leave running on dedicated PC
   - Auto-restarts if any issues

---

## ⚠️ IMPORTANT NOTES

**Don't close these manually:**
- Don't force-close the backend/frontend terminal windows
- Let services stop gracefully (Ctrl+C)
- Sudden termination might corrupt data

**Before closing:**
- Make sure you've finished your trades
- Give server time to save data (~2 seconds)
- Then close terminals normally

**Data Safety:**
- Always backup: `copy server/data/store.json server/data/store.json.backup`
- Data is JSON - human readable
- Can edit directly if needed

---

## 🎉 FINAL SETUP

### Step-by-Step:

1. **First Launch:**
   ```
   Double-click: RUN_BACKGROUND.bat
   ```

2. **Verify Working:**
   ```
   Open: http://localhost:5173
   ```

3. **For Auto-Start (Optional):**
   ```
   Double-click: CREATE_SHORTCUTS.bat
   ```

4. **Next Time:**
   ```
   Services will auto-start or
   Just double-click launcher again
   ```

---

That's it! Your app is now running independently without needing VS Code. 🚀

Questions? Check `START_HERE.md` or `README.md`.
