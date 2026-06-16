@echo off
:: Desmonta o Google Drive de X:\
echo [INFO] Desmontando X:\...
taskkill /f /im rclone.exe >nul 2>&1
timeout /t 2 /nobreak >nul
if not exist "X:\*" (
    echo [OK] Drive desmontado.
) else (
    echo [AVISO] Pode levar alguns segundos para liberar.
)
timeout /t 3
