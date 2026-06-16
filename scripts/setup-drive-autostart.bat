@echo off
:: ============================================================
:: Ckourse - Configura mount automático do Drive no boot
:: ============================================================
:: Cria uma Tarefa Agendada que monta o Drive ao fazer login
:: Roda em background, sem janela, automaticamente.
::
:: Executar UMA VEZ como administrador.
:: ============================================================

title Ckourse - Setup Auto-Mount Drive
echo.
echo ============================================================
echo   Ckourse - Configurar mount automatico do Google Drive
echo ============================================================
echo.
echo   Isso vai criar uma tarefa agendada que monta o Drive
echo   automaticamente toda vez que voce faz login no Windows.
echo.
echo   Unidade: X:\  (pasta Cursos do Google Drive)
echo.
echo ============================================================
echo.

:: Verifica admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Execute como Administrador!
    echo        Clique direito no arquivo e "Executar como administrador"
    pause
    exit /b 1
)

:: Verifica rclone
where rclone >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] rclone nao encontrado. Instale com: winget install rclone
    pause
    exit /b 1
)

:: Pega o caminho completo do rclone
for /f "tokens=*" %%i in ('where rclone') do set RCLONE_PATH=%%i
echo [INFO] rclone encontrado em: %RCLONE_PATH%

:: Verifica se remote gdrive existe
rclone listremotes | findstr /i "gdrive:" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Remote 'gdrive' nao configurado. Configurando...
    rclone config create gdrive drive --drive-scope drive.readonly
)

:: Remove tarefa anterior se existir
schtasks /delete /tn "CkourseGDriveMount" /f >nul 2>&1

:: Cria a tarefa agendada
schtasks /create /tn "CkourseGDriveMount" ^
    /tr "\"%RCLONE_PATH%\" mount gdrive:Cursos X: --vfs-cache-mode full --vfs-read-ahead 128M --vfs-cache-max-age 72h --dir-cache-time 5m --poll-interval 1m --no-console" ^
    /sc onlogon ^
    /rl highest ^
    /f

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo   [OK] Tarefa agendada criada com sucesso!
    echo.
    echo   O Google Drive sera montado em X:\ automaticamente
    echo   toda vez que voce fizer login no Windows.
    echo.
    echo   Para testar agora, rode: mount-drive.bat
    echo   Para remover: schtasks /delete /tn "CkourseGDriveMount" /f
    echo ============================================================
) else (
    echo.
    echo [ERRO] Falha ao criar tarefa agendada.
)

echo.
pause
