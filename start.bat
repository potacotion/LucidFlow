@echo off
title LucidFlow Launcher

echo [LucidFlow] Installing backend dependencies...
cd backend
call pnpm install
cd ..

echo [LucidFlow] Installing frontend dependencies...
cd frontend
call pnpm install
cd ..

echo [LucidFlow] Starting backend server...
start "Backend" cmd /k "cd backend && pnpm run dev:hot"

echo [LucidFlow] Starting frontend server...
start "Frontend" cmd /k "cd frontend && pnpm run dev"

echo [LucidFlow] All services are starting in new windows.
pause