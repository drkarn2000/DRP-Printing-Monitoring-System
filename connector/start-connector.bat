@echo off
title DRP Machine Connector - Floor Host
echo ==============================================================
echo   DRP PRINTING MONITORING SYSTEM - LOCAL MACHINE CONNECTOR
echo ==============================================================
echo.

cd /d "%~dp0"

if not exist ".env" (
    echo [WARNING] .env file not found. Copying from .env.example...
    copy .env.example .env
    echo Please review .env with your floor PC settings.
    pause
)

if not exist "node_modules" (
    echo [INFO] Installing required dependencies...
    npm install
)

echo [INFO] Starting DRP Local Machine Connector...
npm run dev

pause
