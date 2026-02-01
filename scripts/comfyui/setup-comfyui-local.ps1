param(
  [string]$ComfyRoot = "$PSScriptRoot\..\..\.comfyui\ComfyUI",
  [string]$RepoUrl = "https://github.com/comfyanonymous/ComfyUI.git",
  [string]$Python = "py -3.11",
  [switch]$SkipClone
)

$ErrorActionPreference = "Stop"

function Invoke-Checked(
  [Parameter(Mandatory=$true)][string]$Exe,
  [Parameter(Mandatory=$false)][string[]]$Args = @()
) {
  $display = $Exe
  if ($Args -and $Args.Count -gt 0) {
    $display = $display + " " + ($Args -join " ")
  }
  Write-Host "> $display"
  & $Exe @Args
  if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $display"
  }
}

function Split-CommandLine([string]$CommandLine) {
  # Minimal splitter for common cases like: "py -3.11".
  # If you need complex quoting, pass a direct executable path instead.
  return @($CommandLine -split "\s+" | Where-Object { $_ -ne "" })
}

try {
  $parent = Split-Path -Parent $ComfyRoot
  $leaf = Split-Path -Leaf $ComfyRoot
  $resolvedParent = (Resolve-Path -LiteralPath $parent -ErrorAction Stop).Path
  $ComfyRoot = Join-Path $resolvedParent $leaf
} catch {
  $ComfyRoot = (Join-Path $PSScriptRoot "..\..\.comfyui\ComfyUI")
}

if (-not $SkipClone) {
  if (-not (Test-Path -LiteralPath $ComfyRoot)) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $ComfyRoot) -Force | Out-Null
    Invoke-Checked "git" @("clone", $RepoUrl, $ComfyRoot)
  }
}

if (-not (Test-Path -LiteralPath $ComfyRoot)) {
  throw "ComfyUI directory not found at: $ComfyRoot (clone failed or --SkipClone used)"
}

$venvDir = Join-Path $ComfyRoot ".venv"
$pythonExe = Join-Path $venvDir "Scripts\python.exe"

if (-not (Test-Path -LiteralPath $pythonExe)) {
  Push-Location $ComfyRoot
  try {
    $pyTokens = Split-CommandLine $Python
    $pyExe = $pyTokens[0]
    $pyArgs = @()
    if ($pyTokens.Count -gt 1) { $pyArgs = $pyTokens[1..($pyTokens.Count-1)] }
    Invoke-Checked $pyExe ($pyArgs + @("-m", "venv", ".venv"))
  } finally {
    Pop-Location
  }
}

Push-Location $ComfyRoot
try {
  Invoke-Checked $pythonExe @("-m", "pip", "install", "--upgrade", "pip")
  Invoke-Checked $pythonExe @("-m", "pip", "install", "-r", "requirements.txt")
} finally {
  Pop-Location
}

Write-Host "ComfyUI ready at: $ComfyRoot"
Write-Host "Next: run scripts/comfyui/run-comfyui-local.ps1"
