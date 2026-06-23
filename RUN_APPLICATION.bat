@echo off
REM ============================================================================
REM ABCD Work Platform - Development Server Launcher
REM ============================================================================
REM This batch file starts the ABCD Work Platform development server locally
REM No setup needed - just double-click to run!
REM ============================================================================

setlocal enabledelayedexpansion

REM Add common Node.js locations to PATH for fresh shells
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\nodejs\node.exe" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
if defined NVM_SYMLINK if exist "%NVM_SYMLINK%\node.exe" set "PATH=%NVM_SYMLINK%;%PATH%"
if defined NVM_HOME if exist "%NVM_HOME%\node.exe" set "PATH=%NVM_HOME%;%PATH%"

set "NODE_EXE="
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_EXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODE_EXE if exist "%LocalAppData%\Programs\nodejs\node.exe" set "NODE_EXE=%LocalAppData%\Programs\nodejs\node.exe"
if not defined NODE_EXE if defined NVM_SYMLINK if exist "%NVM_SYMLINK%\node.exe" set "NODE_EXE=%NVM_SYMLINK%\node.exe"
if not defined NODE_EXE if defined NVM_HOME if exist "%NVM_HOME%\node.exe" set "NODE_EXE=%NVM_HOME%\node.exe"
if not defined NODE_EXE for /f "delims=" %%i in ('where node 2^>nul') do (
    set "NODE_EXE=%%i"
    goto :node_found
)
:node_found

set "NPM_CMD="
if exist "%ProgramFiles%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
if not defined NPM_CMD if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" set "NPM_CMD=%ProgramFiles(x86)%\nodejs\npm.cmd"
if not defined NPM_CMD if exist "%LocalAppData%\Programs\nodejs\npm.cmd" set "NPM_CMD=%LocalAppData%\Programs\nodejs\npm.cmd"
if not defined NPM_CMD if defined NVM_SYMLINK if exist "%NVM_SYMLINK%\npm.cmd" set "NPM_CMD=%NVM_SYMLINK%\npm.cmd"
if not defined NPM_CMD if defined NVM_HOME if exist "%NVM_HOME%\npm.cmd" set "NPM_CMD=%NVM_HOME%\npm.cmd"
if not defined NPM_CMD set "NPM_CMD=npm"

cls
echo.
echo ========================================================================
echo           ABCD Work Platform - Local Development Server
echo ========================================================================
echo.

REM Check if Node.js is installed
echo Checking requirements...
if not defined NODE_EXE (
    color 4F
    cls
    echo.
    echo ========================================================================
    echo                         ERROR
    echo ========================================================================
    echo Node.js is not installed or not in PATH
    echo.
    echo Please download and install Node.js from: https://nodejs.org/
    echo (Install the LTS version)
    echo.
    echo After installation, restart this batch file.
    echo ========================================================================
    echo.
    pause
    exit /b 1
)

"%NODE_EXE%" --version >nul 2>&1
if errorlevel 1 (
    color 4F
    cls
    echo.
    echo ========================================================================
    echo                         ERROR
    echo ========================================================================
    echo Node.js is not installed or not in PATH
    echo.
    echo Please download and install Node.js from: https://nodejs.org/
    echo (Install the LTS version)
    echo.
    echo After installation, restart this batch file.
    echo ========================================================================
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
call "%NPM_CMD%" --version >nul 2>&1
if errorlevel 1 (
    color 4F
    cls
    echo.
    echo ========================================================================
    echo                         ERROR
    echo ========================================================================
    echo npm is not installed or not in PATH
    echo.
    echo npm usually comes with Node.js. Please reinstall Node.js.
    echo Download from: https://nodejs.org/
    echo ========================================================================
    echo.
    pause
    exit /b 1
)

REM Display installed versions
for /f "tokens=*" %%i in ('"%NODE_EXE%" --version') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('call "%NPM_CMD%" --version') do set NPM_VER=%%i

echo [OK] Node.js %NODE_VER%
echo [OK] npm %NPM_VER%
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    color 3F
    echo Installing dependencies (first run - this may take 1-2 minutes)...
    echo.
    call "%NPM_CMD%" install
    if errorlevel 1 (
        color 4F
        echo.
        echo ERROR: Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
    echo.
    color 2F
    echo [OK] Dependencies installed successfully
    echo.
)

REM Generate Prisma client
echo Preparing database client...
call "%NPM_CMD%" run prisma:generate >nul 2>&1
if errorlevel 1 (
    color 4F
    echo.
    echo ERROR: Failed to generate Prisma client
    echo.
    pause
    exit /b 1
)
echo [OK] Database client ready
echo.

REM All checks passed
color 2F
echo ========================================================================
echo                   All checks passed - Starting server...
echo ========================================================================
echo.
echo The application will be available at:
echo.
echo   Local:   http://localhost:3000
echo   Network: http://YOUR_IP:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================================================
echo.
color 0F

REM Start the development server
call "%NPM_CMD%" run dev

REM If we get here, the server was stopped
echo.
color 3F
echo ========================================================================
echo                    Server stopped
echo ========================================================================
echo.
pause
exit /b 0
