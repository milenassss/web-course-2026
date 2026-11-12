@echo off
setlocal
cd /d "%~dp0"
title Zen Money
if not exist "runtime\node.exe" (
  echo Please extract the entire ZIP before starting.
  echo The runtime folder must be next to START.bat.
  pause
  exit /b 1
)
"%~dp0runtime\node.exe" "%~dp0windows-start.cjs"
echo.
echo Zen Money stopped. You can close this window.
pause
