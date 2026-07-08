# Carrega variaveis do registro
$jh  = [System.Environment]::GetEnvironmentVariable('JAVA_HOME',    'Machine')
$ah  = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'Machine')
$ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME',     'Machine')
if (-not $jh)  { $jh  = [System.Environment]::GetEnvironmentVariable('JAVA_HOME',    'User') }
if (-not $ah)  { $ah  = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User') }
if (-not $ndk) { $ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME',     'User') }
$env:JAVA_HOME    = $jh
$env:ANDROID_HOME = $ah
$env:NDK_HOME     = $ndk

# Adiciona MSVC ao PATH (link.exe, cl.exe)
$msvcBase = 'C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC'
$msvcVer  = Get-ChildItem $msvcBase | Sort-Object Name -Descending | Select-Object -First 1
$msvcBin  = Join-Path $msvcVer.FullName 'bin\Hostx64\x64'

# Adiciona Windows Kit (rc.exe etc)
$kitBin = 'C:\Program Files (x86)\Windows Kits\10\bin'
$kitVer = Get-ChildItem $kitBin -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '10.*' } | Sort-Object Name -Descending | Select-Object -First 1
$kitBinX64 = if ($kitVer) { Join-Path $kitVer.FullName 'x64' } else { '' }

$env:PATH += ';' + $jh + '\bin'
$env:PATH += ';' + $ah + '\platform-tools'
$env:PATH += ';' + $ah + '\cmdline-tools\latest\bin'
$env:PATH += ';' + $env:USERPROFILE + '\.cargo\bin'
$env:PATH += ';' + $msvcBin
if ($kitBinX64) { $env:PATH += ';' + $kitBinX64 }

Write-Host "MSVC bin: $msvcBin"
Write-Host "link.exe existe: $(Test-Path (Join-Path $msvcBin 'link.exe'))"
Write-Host ""

$env:TAURI_CLI = Join-Path $PWD "node_modules\@tauri-apps\cli\tauri.js"

# Verifica dispositivo USB
Write-Host "Verificando dispositivo USB..." -ForegroundColor Cyan
$adbOutput = adb devices 2>&1
$devices = $adbOutput | Where-Object { $_ -match "`t(device|online)$" }

if ($devices) {
    Write-Host "Dispositivo encontrado! Rodando tauri android dev..." -ForegroundColor Green
    npm run tauri -- android dev --target aarch64
} else {
    Write-Host "Nenhum dispositivo USB. Gerando APK apenas para aarch64 (redução de tamanho)..." -ForegroundColor Yellow
    npm run tauri -- android build --target aarch64 --debug

    # Localiza o APK gerado
    $apkSearch = Get-ChildItem -Path "src-tauri\gen\android\app\build\outputs\apk" -Recurse -Filter "*.apk" -ErrorAction SilentlyContinue |
                 Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $dest = "G:\Meu Drive\APKs quentes"
    if ($apkSearch) {
        if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
        $destFile = Join-Path $dest "ckourse-$(Get-Date -Format 'yyyy-MM-dd').apk"
        Copy-Item $apkSearch.FullName $destFile -Force
        Write-Host ""
        Write-Host "APK copiado para: $destFile" -ForegroundColor Green
    } else {
        Write-Host "APK nao encontrado. Verifique erros acima." -ForegroundColor Red
    }
}
