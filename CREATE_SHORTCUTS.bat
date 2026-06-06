@echo off
REM =========================================================
REM   TradespaceAi - Startup Shortcut Creator
REM   Creates shortcuts for easy launching
REM =========================================================

setlocal
cd /d "%~dp0"

echo.
echo Creating TradespaceAi startup shortcuts...
echo.

set DESKTOP=%USERPROFILE%\Desktop
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

REM Create Desktop Shortcut for RUN_BACKGROUND.bat
echo Creating Desktop shortcut...
powershell -Command ^
    "$ws = New-Object -ComObject WScript.Shell;" ^
    "$shortcut = $ws.CreateShortcut('%DESKTOP%\TradespaceAi - Start.lnk');" ^
    "$shortcut.TargetPath = '%cd%\RUN_BACKGROUND.bat';" ^
    "$shortcut.WorkingDirectory = '%cd%';" ^
    "$shortcut.Description = 'Launch TradespaceAi - Background Service';" ^
    "$shortcut.IconLocation = 'C:\Windows\System32\cmd.exe';" ^
    "$shortcut.Save()"

if %errorlevel% equ 0 (
    echo [✓] Desktop shortcut created: TradespaceAi - Start.lnk
) else (
    echo [!] Could not create desktop shortcut
)

REM Ask to add to startup
echo.
set /p ADD_STARTUP="Add to Windows Startup (runs on computer start)? (Y/N): "

if /i "%ADD_STARTUP%"=="Y" (
    echo Creating Startup shortcut...
    powershell -Command ^
        "$ws = New-Object -ComObject WScript.Shell;" ^
        "$shortcut = $ws.CreateShortcut('%STARTUP%\TradespaceAi.lnk');" ^
        "$shortcut.TargetPath = '%cd%\RUN_BACKGROUND.bat';" ^
        "$shortcut.WorkingDirectory = '%cd%';" ^
        "$shortcut.Description = 'TradespaceAi - Auto-Start';" ^
        "$shortcut.WindowStyle = 3;" ^
        "$shortcut.Save()"
    
    if %errorlevel% equ 0 (
        echo [✓] Startup shortcut created!
        echo [✓] App will start automatically next time you restart Windows
    )
)

echo.
echo [✓] Shortcuts created!
echo.
pause
