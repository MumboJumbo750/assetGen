param(
  [string]$ComfyRoot = "$PSScriptRoot\..\..\.comfyui\ComfyUI",
  [string]$WorkflowPath = "$PSScriptRoot\..\..\.comfyui\ComfyUI\user\default\workflows\assetgen_sdxl_api.json",
  [string]$CheckpointName = ""
)

$ErrorActionPreference = "Stop"

function Resolve-FullPath([string]$path) {
  if ([System.IO.Path]::IsPathRooted($path)) { return $path }
  return (Resolve-Path -Path $path).Path
}

$comfyRootFull = Resolve-FullPath $ComfyRoot
$workflowFull = Resolve-FullPath $WorkflowPath
$checkpointsDir = Join-Path $comfyRootFull "models\checkpoints"

if (-not (Test-Path $workflowFull)) {
  throw "Workflow JSON not found: $workflowFull"
}

if (-not (Test-Path $checkpointsDir)) {
  throw "Checkpoints directory not found: $checkpointsDir"
}

# Find candidate checkpoint files.
$candidates = Get-ChildItem -Path $checkpointsDir -File -ErrorAction Stop |
  Where-Object { $_.Name -match '\.(safetensors|ckpt)$' } |
  Where-Object { $_.Name -ne 'put_checkpoints_here' } |
  Sort-Object -Property Name

if ([string]::IsNullOrWhiteSpace($CheckpointName)) {
  if ($candidates.Count -eq 0) {
    Write-Host "No checkpoint files found in: $checkpointsDir" -ForegroundColor Yellow
    Write-Host "Download an SDXL checkpoint (.safetensors) and place it there, then re-run:" -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\comfyui\set-checkpoint.ps1" -ForegroundColor Yellow
    exit 2
  }

  if ($candidates.Count -eq 1) {
    $CheckpointName = $candidates[0].Name
    Write-Host "Using the only checkpoint found: $CheckpointName"
  } else {
    Write-Host "Multiple checkpoints found. Re-run with one of these names:" -ForegroundColor Yellow
    $candidates | ForEach-Object { Write-Host "  - $($_.Name)" }
    Write-Host "Example:" -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\comfyui\set-checkpoint.ps1 -CheckpointName \"$($candidates[0].Name)\"" -ForegroundColor Yellow
    exit 3
  }
}

# Validate selected checkpoint exists.
$selectedPath = Join-Path $checkpointsDir $CheckpointName
if (-not (Test-Path $selectedPath)) {
  throw "Checkpoint file not found: $selectedPath"
}

# Load workflow and update any CheckpointLoaderSimple nodes.
$raw = Get-Content -Path $workflowFull -Raw -Encoding UTF8
$workflow = $raw | ConvertFrom-Json

$updated = 0
foreach ($nodeProp in $workflow.PSObject.Properties) {
  $node = $nodeProp.Value
  if ($null -eq $node) { continue }
  if ($node.class_type -eq "CheckpointLoaderSimple") {
    if ($null -eq $node.inputs) {
      $node | Add-Member -MemberType NoteProperty -Name inputs -Value (@{}) -Force
    }
    $node.inputs.ckpt_name = $CheckpointName
    $updated += 1
  }
}

if ($updated -eq 0) {
  Write-Host "Warning: no CheckpointLoaderSimple nodes found in workflow; nothing changed." -ForegroundColor Yellow
} else {
  Write-Host "Updated $updated node(s): ckpt_name = $CheckpointName"
}

# Write back.
$workflow | ConvertTo-Json -Depth 100 | Set-Content -Path $workflowFull -Encoding UTF8
Write-Host "Wrote: $workflowFull"
