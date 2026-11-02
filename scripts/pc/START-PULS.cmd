@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Bitte zuerst Node.js LTS ab Version 22 von https://nodejs.org installieren.
 echo Danach dieses Fenster schliessen und START-PULS.cmd erneut oeffnen.
 pause
 exit /b 1
)
node server.mjs
pause
