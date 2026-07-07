# Carrega variaveis direto do registro (independente de quando foram salvas)
$jh  = [System.Environment]::GetEnvironmentVariable('JAVA_HOME',   'Machine')
$ah  = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME','Machine')
$ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME',    'Machine')

if (-not $jh)  { $jh  = [System.Environment]::GetEnvironmentVariable('JAVA_HOME',   'User') }
if (-not $ah)  { $ah  = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME','User') }
if (-not $ndk) { $ndk = [System.Environment]::GetEnvironmentVariable('NDK_HOME',    'User') }

if ($jh)  { $env:JAVA_HOME    = $jh;  $env:PATH += ";$jh\bin" }
if ($ah)  { $env:ANDROID_HOME = $ah }
if ($ndk) { $env:NDK_HOME     = $ndk }

& "$PSScriptRoot\check-android-env.ps1"
