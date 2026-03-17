@echo off
setlocal
cd /d "%~dp0backend"
"..\tools\python\runtime\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000
