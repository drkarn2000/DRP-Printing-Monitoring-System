@echo off
title Install DRP Connector Windows Service
echo ==============================================================
echo   INSTALLING DRP MACHINE CONNECTOR AS WINDOWS SERVICE
echo ==============================================================
echo.

:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script must be run as Administrator.
    echo Right-click this file and select 'Run as administrator'.
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1/3] Building connector production bundle...
call npm install
call npm run build

echo [2/3] Configuring Windows Service via NSSM...
if not exist "nssm.exe" (
    echo Downloading NSSM service helper...
    powershell -Command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'nssm.zip'; Expand-Archive nssm.zip -DestinationPath . -Force; Move-Item 'nssm-2.24\win64\nssm.exe' 'nssm.exe' -Force; Remove-Item -Recurse 'nssm-2.24', 'nssm.zip' -ErrorAction SilentlyContinue"
)

nssm install DRPConnector "%ProgramFiles%\nodejs\node.exe" "%~dp0dist\index.js"
nssm set DRPConnector AppDirectory "%~dp0"
nssm set DRPConnector Description "DRP Printing Monitoring Local Machine Connector"
nssm set DRPConnector Start SERVICE_AUTO_START

echo [3/3] Starting DRPConnector service...
nssm start DRPConnector

echo.
echo ==============================================================
echo   SUCCESS: DRP Machine Connector is installed and running!
echo   It will automatically start whenever Windows boots.
echo ==============================================================
pause
