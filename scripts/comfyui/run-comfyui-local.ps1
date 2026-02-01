param(
  [string]$ComfyRoot = "$PSScriptRoot\..\..\.comfyui\ComfyUI",
  [string]$Listen = "127.0.0.1",
  [int]$Port = 8188,
  [switch]$Cpu
)

$ErrorActionPreference = "Stop"

try {
  $ComfyRoot = (Resolve-Path -LiteralPath $ComfyRoot -ErrorAction Stop).Path
} catch {
  # Keep provided path as-is
}
$pythonExe = Join-Path $ComfyRoot ".venv\Scripts\python.exe"
$mainPy = Join-Path $ComfyRoot "main.py"

if (-not (Test-Path -LiteralPath $ComfyRoot)) {
  throw "ComfyUI not found at: $ComfyRoot. Run scripts/comfyui/setup-comfyui-local.ps1 first."
}
if (-not (Test-Path -LiteralPath $pythonExe)) {
  throw "ComfyUI venv not found at: $pythonExe. Run scripts/comfyui/setup-comfyui-local.ps1 first."
}
if (-not (Test-Path -LiteralPath $mainPy)) {
  throw "ComfyUI main.py not found at: $mainPy"
}

Write-Host "Starting ComfyUI: $ComfyRoot"
Write-Host "URL: http://$Listen`:$Port"

$extraArgs = @()

if ($Cpu) {
  $extraArgs += "--cpu"
} else {
  # Auto-fallback to CPU if Torch has no CUDA.
  try {
    $cudaAvailable = & $pythonExe -c "import torch; print(int(torch.cuda.is_available()))" 2>$null
    if ([string]$cudaAvailable -match '^\s*0\s*$') {
      Write-Host "Torch CUDA not available; starting with --cpu"
      $extraArgs += "--cpu"
    }
  } catch {
    Write-Host "Could not detect CUDA; starting with --cpu"
    $extraArgs += "--cpu"
  }
}

Push-Location $ComfyRoot
try {
  & $pythonExe $mainPy --listen $Listen --port $Port @extraArgs
} finally {
  Pop-Location
}
