@echo off
title Ckourse - Download do Google Drive
python "%~dp0download-drive.py"
if %errorlevel% neq 0 (
    echo.
    echo Erro ao executar. Verifique se Python esta instalado.
    echo Instale com: winget install Python.Python.3
    pause
)
