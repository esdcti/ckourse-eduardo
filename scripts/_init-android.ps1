$jh  = [System.Environment]::GetEnvironmentVariable('JAVA_HOME',    'Machine')
$ah  = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'Machine')
$ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME',     'Machine')
if (-not $jh)  { $jh  = [System.Environment]::GetEnvironmentVariable('JAVA_HOME',    'User') }
if (-not $ah)  { $ah  = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User') }
if (-not $ndk) { $ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME',     'User') }
$env:JAVA_HOME    = $jh
$env:ANDROID_HOME = $ah
$env:NDK_HOME     = $ndk
$env:PATH += ';' + $jh + '\bin;' + $ah + '\platform-tools;' + $ah + '\cmdline-tools\latest\bin;' + $env:USERPROFILE + '\.cargo\bin'
Write-Host "JAVA_HOME    = $env:JAVA_HOME"
Write-Host "ANDROID_HOME = $env:ANDROID_HOME"
Write-Host "NDK_HOME     = $env:NDK_HOME"
Write-Host ""
& ".\node_modules\.bin\tauri" android init
