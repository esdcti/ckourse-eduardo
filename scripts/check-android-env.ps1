# ============================================================
# Ckourse Mobile — Verificador de Ambiente Android
# ============================================================

$errors = 0

function Check($label, $ok, $detail = "") {
    if ($ok) {
        Write-Host "  [OK] $label" -ForegroundColor Green
        if ($detail) { Write-Host "       $detail" -ForegroundColor DarkGray }
    } else {
        Write-Host "  [X]  $label" -ForegroundColor Red
        if ($detail) { Write-Host "       $detail" -ForegroundColor DarkGray }
        $script:errors++
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Ckourse Mobile - Verificador de Ambiente  " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---- Node.js ----
Write-Host ">> Node.js / npm" -ForegroundColor Yellow
try {
    $nodeVer = node --version 2>&1
    $npmVer  = npm --version 2>&1
    $nodeOk  = $nodeVer -match "v(\d+)\." -and [int]$Matches[1] -ge 18
    Check "Node.js $nodeVer" $nodeOk "minimo: v18"
    Check "npm $npmVer" ($npmVer -notmatch "not recognized")
} catch {
    Check "Node.js" $false "nao encontrado no PATH"
}

# ---- Rust ----
Write-Host ""
Write-Host ">> Rust / rustup" -ForegroundColor Yellow
$rustupExe = "$env:USERPROFILE\.cargo\bin\rustup.exe"
$rustupFound = Test-Path $rustupExe
if (-not $rustupFound) {
    try { $v = rustup --version 2>&1; $rustupFound = $v -notmatch "not recognized" } catch {}
    if ($rustupFound) { $rustupExe = "rustup" }
}
Check "rustup instalado" $rustupFound "se falhou: instale em https://rustup.rs"

if ($rustupFound) {
    $targets = & $rustupExe target list --installed 2>&1
    foreach ($t in @("aarch64-linux-android","armv7-linux-androideabi","i686-linux-android","x86_64-linux-android")) {
        Check "Rust target: $t" ($targets -contains $t)
    }
}

# ---- Java ----
Write-Host ""
Write-Host ">> Java (JDK)" -ForegroundColor Yellow
$javaHome = $env:JAVA_HOME
Check "JAVA_HOME definido" ($javaHome -and (Test-Path $javaHome)) $(if ($javaHome) { $javaHome } else { "variavel nao encontrada" })
try {
    $jv = java -version 2>&1 | Select-Object -First 1
    Check "java no PATH" ($jv -notmatch "not recognized") "$jv"
} catch { Check "java no PATH" $false }

# ---- Android SDK ----
Write-Host ""
Write-Host ">> Android SDK" -ForegroundColor Yellow
$aHome = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
Check "SDK em $aHome" (Test-Path $aHome)
$adbOk = $false
try { $adbOk = (adb --version 2>&1) -notmatch "not recognized" } catch {}
if (-not $adbOk) { $adbOk = Test-Path "$aHome\platform-tools\adb.exe" }
Check "adb / platform-tools" $adbOk "adicione %ANDROID_HOME%\platform-tools ao PATH"
Check "SDK Build-Tools" (Test-Path "$aHome\build-tools")

# ---- NDK ----
Write-Host ""
Write-Host ">> Android NDK" -ForegroundColor Yellow
$ndkHome = $env:NDK_HOME
$ndkOk = $ndkHome -and (Test-Path $ndkHome)
if (-not $ndkOk) {
    $ndkDir = "$aHome\ndk"
    if (Test-Path $ndkDir) {
        $v = Get-ChildItem $ndkDir -Directory | Sort-Object Name -Descending | Select-Object -First 1
        if ($v) { $ndkOk = $true; Write-Host "  [!]  NDK_HOME nao definido, NDK encontrado em $($v.FullName)" -ForegroundColor DarkYellow }
    }
}
Check "NDK instalado" $ndkOk $(if ($ndkHome) { $ndkHome } else { "instale via SDK Manager > SDK Tools > NDK (Side by side)" })

# ---- Resumo ----
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "  TUDO OK! Ambiente pronto para mobile." -ForegroundColor Green
    Write-Host "  Proximo passo: npm run tauri android init" -ForegroundColor White
} else {
    Write-Host "  $errors item(ns) com problema — veja [X] acima" -ForegroundColor Red
    Write-Host "  Consulte: ANDROID\SETUP.md" -ForegroundColor Yellow
}
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
