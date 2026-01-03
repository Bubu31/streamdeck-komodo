@echo off
echo Deploying Komodo Stack Monitor plugin...

set PLUGIN_NAME=com.komodo.stack-monitor.sdPlugin
set DEST=%APPDATA%\Elgato\StreamDeck\Plugins\%PLUGIN_NAME%

echo Stopping Stream Deck...
taskkill /IM "StreamDeck.exe" /F 2>nul

timeout /t 2 /nobreak >nul

echo Removing old plugin...
if exist "%DEST%" rmdir /S /Q "%DEST%"

echo Copying new plugin...
xcopy /E /I /Y "%~dp0%PLUGIN_NAME%" "%DEST%"

echo Starting Stream Deck...
start "" "%ProgramFiles%\Elgato\StreamDeck\StreamDeck.exe"

echo Done!
pause
