@echo off
cd /d c:\xampp\htdocs\jatelier-store
call npm run build > build-output.txt 2>&1
echo BUILD COMPLETE
type build-output.txt
