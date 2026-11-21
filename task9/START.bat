@echo off
setlocal
cd /d "%~dp0"
title Todo - React

if not exist "package.json" goto missing_files
if not exist "src\main.jsx" goto missing_files

where node >nul 2>nul
if errorlevel 1 goto missing_node
where npm.cmd >nul 2>nul
if errorlevel 1 goto missing_node

node -e "const [major,minor]=process.versions.node.split('.').map(Number); process.exit((major===20 && minor>=19)||(major===22 && minor>=12)||major>22 ? 0 : 1)"
if errorlevel 1 goto old_node

if exist "node_modules\.bin\vite.cmd" goto launch
echo First start: installing dependencies. Please wait...
echo Internet connection is required for this step.
call npm.cmd ci --include=dev --no-audit --no-fund
if errorlevel 1 goto install_error

:launch
echo Starting Todo. The browser will open automatically.
echo Keep this window open while using the app.
echo To stop, close this window.
call npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort --open
if errorlevel 1 goto start_error
goto end

:missing_files
echo Please extract the entire ZIP, then run START.bat from the extracted folder.
goto end

:missing_node
echo Node.js is not installed or is not available.
echo Install the LTS version from https://nodejs.org/
echo Then close this window and run START.bat again.
goto end

:old_node
echo This Node.js version is too old for the project.
echo Install a current LTS version from https://nodejs.org/
goto end

:install_error
echo Installation failed. Check your internet connection and run START.bat again.
echo If it fails again, send a photo of this window to the project sender.
goto end

:start_error
echo Could not start. Close any previous Todo window and try again.
echo If it fails again, send a photo of this window to the project sender.

:end
echo.
pause
endlocal
