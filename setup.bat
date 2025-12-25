@echo off
echo Setting up GeoExtractor...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found
node --version
echo npm found
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Installation complete!
    echo.
    echo You're all set! To start the development server, run:
    echo.
    echo    npm run dev
    echo.
    echo Then open your browser to the URL shown in the terminal.
) else (
    echo.
    echo Installation failed. Please check the error messages above.
    pause
    exit /b 1
)

pause
