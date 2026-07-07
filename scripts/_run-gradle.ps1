$jh = [System.Environment]::GetEnvironmentVariable('JAVA_HOME', 'Machine')
$ah = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'Machine')
$ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME', 'Machine')
if (-not $jh) { $jh = [System.Environment]::GetEnvironmentVariable('JAVA_HOME', 'User') }
if (-not $ah) { $ah = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User') }
if (-not $ndk) { $ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME', 'User') }
$env:JAVA_HOME = $jh
$env:ANDROID_HOME = $ah
$env:NDK_HOME = $ndk
$env:TAURI_CLI = Join-Path $PWD "node_modules\@tauri-apps\cli\tauri.js"
$env:PATH += ';' + $jh + '\bin;' + $ah + '\platform-tools;' + $ah + '\cmdline-tools\latest\bin'
cd src-tauri\gen\android
.\gradlew.bat assembleUniversalRelease
