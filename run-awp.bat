@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "START_SERVER=1"
set "FORCE_DB_SYNC=0"
for %%A in (%*) do (
  if /I "%%~A"=="--setup-only" set "START_SERVER=0"
  if /I "%%~A"=="--force-db-sync" set "FORCE_DB_SYNC=1"
)

title AWP Auto Runner

cd /d "%~dp0"
echo ==================================================
echo   AWP - Auto Setup and Run
echo   Project: %cd%
echo ==================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Install Node.js 20+ and re-run this file.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available in PATH.
  pause
  exit /b 1
)

echo [1/5] Checking dependencies...
if not exist "node_modules" (
  echo Installing npm packages ^(legacy peer deps enabled^)...
  call npm install --legacy-peer-deps
  if errorlevel 1 goto :fail
) else (
  echo node_modules found. Skipping npm install.
)
echo.

echo [2/5] Checking .env...
if not exist ".env" (
  if not exist ".env.example" (
    echo [ERROR] .env.example not found.
    goto :fail
  )
  copy /Y ".env.example" ".env" >nul
  echo Created .env from .env.example

  for /f %%S in ('node -e "process.stdout.write(require(''crypto'').randomBytes(32).toString(''base64''))"') do set "NEXTAUTH_SECRET_VALUE=%%S"
  powershell -NoProfile -Command "$p='.env'; $s=Get-Content $p -Raw; $s=$s -replace 'NEXTAUTH_SECRET=\"your-strong-random-secret-here\"','NEXTAUTH_SECRET=\"%NEXTAUTH_SECRET_VALUE%\"'; Set-Content $p $s"
  if errorlevel 1 goto :fail
  echo Generated NEXTAUTH_SECRET in .env
) else (
  echo .env found. Skipping creation.
)
echo.

echo [3/5] Syncing database schema...
set "RUN_DB_TASKS=0"
if "%FORCE_DB_SYNC%"=="1" (
  set "RUN_DB_TASKS=1"
)
if not exist "prisma\awp.db" if not exist "prisma\prisma\awp.db" (
  set "RUN_DB_TASKS=1"
)

if "%RUN_DB_TASKS%"=="1" (
  call npx prisma db push
  if errorlevel 1 goto :fail
) else (
  echo Existing database found. Skipping prisma db push.
)
echo.

echo [4/5] Running seed script...
if "%RUN_DB_TASKS%"=="1" (
  call npm run prisma:seed
  if errorlevel 1 goto :fail
) else (
  echo Existing database found. Skipping seed.
)
echo.

if "%START_SERVER%"=="0" (
  echo [5/5] Setup complete. Server start skipped ^(--setup-only^).
  echo You can run this later without arguments to start dev server.
  goto :eof
)

echo [5/5] Starting dev server...
echo Open: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
call npm run dev
goto :eof

:fail
echo.
echo [FAILED] Setup or startup failed.
echo Check the error messages above.
pause
exit /b 1
