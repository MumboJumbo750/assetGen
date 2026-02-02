$ErrorActionPreference = "Stop"
$pVer = "3.11.8"
$pUrl = "https://www.python.org/ftp/python/$pVer/python-$pVer-embed-amd64.zip"
$pipUrl = "https://bootstrap.pypa.io/get-pip.py"
$destDir = "$PSScriptRoot\..\.python"

Write-Host "Checking for local Python environment..."

if (Test-Path "$destDir\python.exe") {
    Write-Host "Local Python found at $destDir"
    exit 0
}

Write-Host "Downloading Python $pVer Embeddable..."
Invoke-WebRequest -Uri $pUrl -OutFile "python.zip"

Write-Host "Extracting..."
Expand-Archive -Path "python.zip" -DestinationPath $destDir -Force
Remove-Item "python.zip"

# Enable site-packages (crucial for pip)
$pthFile = Get-ChildItem "$destDir\*._pth" | Select-Object -First 1
if ($pthFile) {
    $content = Get-Content $pthFile.FullName
    $content = $content -replace "#import site", "import site"
    Set-Content $pthFile.FullName $content
    Write-Host "Enabled site-packages in $($pthFile.Name)"
}

# Install Pip
Write-Host "Downloading get-pip.py..."
Invoke-WebRequest -Uri $pipUrl -OutFile "$destDir\get-pip.py"

Write-Host "Installing Pip..."
& "$destDir\python.exe" "$destDir\get-pip.py" --no-warn-script-location

# Install Dependencies
Write-Host "Installing Dependencies (Pillow)..."
& "$destDir\python.exe" -m pip install Pillow --no-warn-script-location

Write-Host "Local Python Environment Setup Complete."
