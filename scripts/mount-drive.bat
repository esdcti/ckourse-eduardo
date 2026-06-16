@echo off
:: ============================================================
:: Ckourse - Monta Google Drive como X:\Cursos
:: ============================================================
:: Executa rclone mount em background (sem janela)
:: A pasta "Cursos" do Google Drive fica acessível em X:\Cursos
::
:: Uso:
::   1. Duplo-clique para montar manualmente
::   2. Ou rode setup-drive-autostart.bat para montar no boot
:: ============================================================

title Ckourse - Google Drive Mount

:: Verifica se rclone existe
where rclone >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] rclone nao encontrado. Instale com: winget install rclone
    pause
    exit /b 1
)

:: Verifica se ja esta montado
if exist "X:\*" (
    echo [INFO] Drive ja esta montado em X:\
    echo        Tudo pronto para usar no Ckourse.
    timeout /t 3
    exit /b 0
)

:: Verifica se remote gdrive existe
rclone listremotes | findstr /i "gdrive:" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Remote 'gdrive' nao configurado. Configurando agora...
    echo        Isso vai abrir o navegador para autorizar.
    echo.
    rclone config create gdrive drive --drive-scope drive.readonly
    echo.
)

echo [INFO] Montando Google Drive em X:\
echo        Pasta: Cursos
echo.

:: Monta em background (sem janela)
start "" /min rclone mount gdrive:Cursos X: ^
    --vfs-cache-mode full ^
    --vfs-read-ahead 128M ^
    --vfs-cache-max-age 72h ^
    --dir-cache-time 5m ^
    --poll-interval 1m ^
    --no-console

:: Aguarda montar
timeout /t 3 /nobreak >nul

if exist "X:\*" (
    echo [OK] Drive montado com sucesso em X:\
    echo      Abra o Ckourse e importe cursos de X:\
) else (
    echo [AVISO] Montagem pode levar alguns segundos...
    echo         Se nao aparecer, verifique se WinFsp esta instalado.
)

timeout /t 5
