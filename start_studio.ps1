$root = Get-Location
Write-Host "Starting AssetsGen Studio..."

# --- PORT CLEANUP HELPERS ---
function Get-ProcessesByPort($port) {
    $pids = @()
    if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
        try {
            $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            if ($conns) {
                $pids += $conns | Select-Object -ExpandProperty OwningProcess
            }
        } catch {}
    } else {
        try {
            $lines = netstat -ano -p TCP | Select-String -Pattern (":$port\\s")
            foreach ($line in $lines) {
                $m = [regex]::Match($line.ToString(), "\\s+(\\d+)\\s*$")
                if ($m.Success) { $pids += [int]$m.Groups[1].Value }
            }
        } catch {}
    }
    return $pids | Sort-Object -Unique
}

function Stop-ProcessesByPort($port, $label) {
    $pids = Get-ProcessesByPort $port
    if ($pids.Count -eq 0) { return }
    Write-Host "Stopping $label on port $port (PID(s): $($pids -join ', '))..."
    foreach ($pid in $pids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

# --- CHECK PYTHON ---
$LocalPython = ".\scripts\.python\python.exe"
$pythonExe = ""
$pythonPreArgs = @()

# 1. Try Local Python
if (Test-Path $LocalPython) {
    $pythonExe = $LocalPython
    Write-Host "Using Local Python: $pythonExe"
} else {
    # 2. Try 'py' (Windows Launcher)
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $pythonExe = "py"
        $pythonPreArgs = @("-3.11")
        Write-Host "Using Windows Launcher: py -3.11"
    } else {
        # 3. Try standard 'python'
        if (Get-Command python -ErrorAction SilentlyContinue) {
            try {
                $ver = python --version 2>&1
                if ($LASTEXITCODE -eq 0 -and $ver -match "Python") {
                     $pythonExe = "python"
                     Write-Host "Using System Python: $pythonExe ($ver)"
                }
            } catch {}
        }
    }
}

# 4. If nothing works, Install Local Python
if (-not $pythonExe) {
    Write-Host "No valid Python installation found."
    $choice = Read-Host "Would you like to auto-download a local Python environment? (Y/N)"
    if ($choice -eq 'Y' -or $choice -eq 'y') {
        Write-Host "Downloading Portable Python..."
        & powershell.exe -File ".\scripts\install_python_env.ps1"
        $pythonExe = ".\scripts\.python\python.exe"
        if (-not (Test-Path $pythonExe)) {
             Write-Host "Installation failed. Please install Python manually."
             exit 1
        }
    } else {
        Write-Host "Please install Python 3.10+ manually and run this script again."
        exit 1
    }
}


# --- START SERVERS ---

# Ensure ports are free before starting
Stop-ProcessesByPort 8002 "backend"
Stop-ProcessesByPort 5173 "frontend"

# Start Backend
Write-Host "Launching Backend (Port 8002)..."
$backendArgs = $pythonPreArgs + @("-m", "studio.backend.server")
$backend = Start-Process $pythonExe -ArgumentList $backendArgs -WorkingDirectory $root -PassThru -NoNewWindow

if (-not $backend) {
    Write-Host "Failed to launch backend with $pythonExe. Exiting."
    exit 1
}

# Start Frontend
Write-Host "Launching Frontend (Port 5173)..."
$frontend = Start-Process npm.cmd -ArgumentList "run", "dev" -WorkingDirectory "$root/studio/frontend" -PassThru -NoNewWindow


Write-Host "---------------------------------------------------"
Write-Host "AssetsGen Studio is running."
Write-Host "Access at: http://localhost:5173"
Write-Host "Press ENTER to stop server and exit."
Write-Host "---------------------------------------------------"

Read-Host

# Cleanup
Write-Host "Stopping processes..."
if ($backend.Id) {
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
}
if ($frontend.Id) {
    taskkill /F /T /PID $frontend.Id | Out-Null
}
if ($backend.Id) {
    taskkill /F /T /PID $backend.Id | Out-Null
}
Stop-ProcessesByPort 8002 "backend"
Stop-ProcessesByPort 5173 "frontend"

Write-Host "Stopped."
