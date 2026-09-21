@echo off
set "PATH=C:\Users\ravne\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
cd /d "C:\Users\ravne\Documents\Codex\2026-09-16\we\outputs\punjab-hosiery"
start "Punjab Hosiery Server" /B cmd /c call "C:\Users\ravne\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" dev --port 3002
timeout /t 5 /nobreak >nul
start "Punjab Hosiery" http://localhost:3002/admin/login
echo Punjab Hosiery is starting. Keep this window open while using the website.
pause
