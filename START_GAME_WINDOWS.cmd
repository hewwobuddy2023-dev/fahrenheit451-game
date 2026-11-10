@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24, then reopen this launcher.
  pause
  exit /b 1
)
if exist "02_PRODUCTION_BUILD\dist\index.html" (
  node "01_SOURCE\fahrenheit451-game\tools\serve-review.cjs" "02_PRODUCTION_BUILD\dist"
) else (
  node "tools\serve-review.cjs"
)
pause
