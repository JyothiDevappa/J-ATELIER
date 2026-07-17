@echo off
echo ===================================================
echo   Antigravity Terminal Diagnostic Utility v2
echo ===================================================
echo.

echo [1/3] Measuring Command Prompt (cmd.exe) launch time:
echo Start: %time%
cmd.exe /c "exit"
echo End:   %time%
echo.

echo [2/3] Measuring Windows PowerShell launch time:
echo Start: %time%
powershell.exe -NoProfile -Command "exit"
echo End:   %time%
echo.

echo [3/3] Diagnostic Summary:
echo - If Windows PowerShell launch time (Start to End) is more than 2-3 seconds,
echo   your system's PowerShell initialization is slow (often caused by Windows Defender
echo   scanning powershell.exe on startup).
echo.
pause
