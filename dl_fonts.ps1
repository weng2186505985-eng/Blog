$FontUrls = @(
    "https://gstatic.loli.net/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG4HFnYw.ttf",
    "https://gstatic.loli.net/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYw.ttf",
    "https://gstatic.loli.net/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG-3FnYw.ttf",
    "https://gstatic.loli.net/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaGzjCnYw.ttf",
    "https://gstatic.loli.net/s/notoserifsc/v35/H4cyBXePl9DZ0Xe7gG9cyOj7uK2-n-D2rd4FY7SCqyWv.ttf",
    "https://gstatic.loli.net/s/notoserifsc/v35/H4cyBXePl9DZ0Xe7gG9cyOj7uK2-n-D2rd4FY7RcrCWv.ttf",
    "https://gstatic.loli.net/s/notoserifsc/v35/H4cyBXePl9DZ0Xe7gG9cyOj7uK2-n-D2rd4FY7RlrCWv.ttf",
    "https://gstatic.loli.net/s/orbitron/v35/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6xpg.ttf",
    "https://gstatic.loli.net/s/orbitron/v35/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1ny_Cmxpg.ttf",
    "https://gstatic.loli.net/s/orbitron/v35/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimxpg.ttf"
)

$OutDir = "d:\code\blog\public\fonts"
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

foreach ($url in $FontUrls) {
    $filename = Split-Path $url -Leaf
    $OutPath = Join-Path $OutDir $filename
    Write-Host "Downloading $filename..."
    Invoke-WebRequest -Uri $url -OutFile $OutPath
}
Write-Host "Done!"
