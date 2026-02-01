param(
    [string]$ComfyUrl = "http://127.0.0.1:8188",
    [Parameter(Mandatory = $true)][string]$Checkpoint,
    [Parameter(Mandatory = $true)][string]$Variant,
    [ValidateSet('juggernaut','animagine','pony','protovision','sdxl','copax')][string]$PromptStyle = "juggernaut",
    [string]$Vae = $null,
    [int]$MaxRenderDim = 768,
    [int]$Seed = 12345,
    [int]$ComfyStartTimeoutSec = 240,
    [switch]$SkipComfyUi,
    [switch]$Cpu,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\.."))
$variantRoot = Join-Path $repoRoot "assets\zelos_variants\$Variant"
$buildDir = Join-Path $repoRoot "build"
$reportPath = Join-Path $buildDir "$Variant-report.json"
$comfyLogPath = Join-Path $buildDir "comfyui-$Variant.log"
$comfyErrLogPath = Join-Path $buildDir "comfyui-$Variant.err.log"
$comfyPidPath = Join-Path $buildDir "comfyui-$Variant.pid"

New-Item -ItemType Directory -Force -Path $variantRoot | Out-Null
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

function Test-ComfyUi {
    param([string]$Url)

    try {
        Invoke-RestMethod -Uri ($Url.TrimEnd('/') + '/system_stats') -TimeoutSec 3 | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Ensure-ComfyUiRunning {
    param(
        [string]$Url,
        [int]$TimeoutSec,
        [switch]$ForceCpu
    )

    if (Test-ComfyUi -Url $Url) {
        Write-Host "ComfyUI already running: $Url"
        return
    }

    $runScript = Join-Path $repoRoot 'scripts\comfyui\run-comfyui-local.ps1'
    if (-not (Test-Path -LiteralPath $runScript)) {
        throw "Cannot start ComfyUI; missing script: $runScript"
    }

    if (Test-Path -LiteralPath $comfyPidPath) {
        try {
            $oldPid = (Get-Content -LiteralPath $comfyPidPath -ErrorAction Stop | Select-Object -First 1)
            if ($oldPid -match '^\d+$') {
                $p = Get-Process -Id ([int]$oldPid) -ErrorAction SilentlyContinue
                if ($p) {
                    Write-Host "Found prior ComfyUI PID $oldPid; waiting for it to become ready..."
                    $deadline = (Get-Date).AddSeconds($TimeoutSec)
                    while ((Get-Date) -lt $deadline) {
                        if (Test-ComfyUi -Url $Url) {
                            Write-Host "ComfyUI is ready: $Url"
                            return
                        }
                        if (-not (Get-Process -Id ([int]$oldPid) -ErrorAction SilentlyContinue)) {
                            break
                        }
                        Start-Sleep -Milliseconds 700
                    }
                }
            }
        } catch {
            # ignore
        }
    }

    Write-Host "Starting ComfyUI in a detached process (log: $comfyLogPath)"

    $args = @(
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File', $runScript
    )
    if ($ForceCpu) {
        $args += '-Cpu'
    }

    $proc = Start-Process -FilePath 'powershell' -ArgumentList $args -PassThru -RedirectStandardOutput $comfyLogPath -RedirectStandardError $comfyErrLogPath
    Set-Content -LiteralPath $comfyPidPath -Value ($proc.Id.ToString()) -Encoding ASCII

    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Test-ComfyUi -Url $Url) {
            Write-Host "ComfyUI is ready: $Url"
            return
        }
        Start-Sleep -Milliseconds 700
    }

    $tailOut = $null
    $tailErr = $null
    try { if (Test-Path -LiteralPath $comfyLogPath) { $tailOut = (Get-Content -LiteralPath $comfyLogPath -Tail 30 | Out-String) } } catch {}
    try { if (Test-Path -LiteralPath $comfyErrLogPath) { $tailErr = (Get-Content -LiteralPath $comfyErrLogPath -Tail 30 | Out-String) } } catch {}
    throw "ComfyUI did not become ready within ${TimeoutSec}s. Logs: $comfyLogPath / $comfyErrLogPath\n---stdout tail---\n$tailOut\n---stderr tail---\n$tailErr"
}

if (-not $SkipComfyUi) {
    Ensure-ComfyUiRunning -Url $ComfyUrl -TimeoutSec $ComfyStartTimeoutSec -ForceCpu:$Cpu
}

# Regex from scripts/comfyui/checkpoint-test-sample.json (v2)
$onlyRegex = "(astro-duck-base-(front|side|three-quarter)|astro-duck-(happy|excited|curious)-(front|side)|outfit-(default-suit|pirate|wizard)-(front|side)|texture-(ocean|lava|ice|gas-giant|tech)|satellite-(config|portals|modules)|ring-cyan|atmosphere-(thin|normal|thick)|state-(selected|hovered|error)|glow-(hover|selected)|badge-(warning|error))"

Write-Host "[1/2] Validating missing assets into report: $reportPath"
py -3.11 (Join-Path $repoRoot "scripts\validate-assets.py") --root $variantRoot --report json --report-path $reportPath

Write-Host "[2/2] Generating sample set into: $variantRoot"

$genArgs = @(
    (Join-Path $repoRoot "scripts\comfyui\generate-assets.py"),
    "--report", $reportPath,
    "--variant", $Variant,
    "--comfy", $ComfyUrl,
    "--ckpt", $Checkpoint,
    "--prompt-style", $PromptStyle,
    "--fit-vram",
    "--max-render-dim", $MaxRenderDim,
    "--auto-alpha",
    "--seed", $Seed,
    "--only", $onlyRegex
)

if ($Vae) {
    $genArgs += @("--vae", $Vae)
}

if ($DryRun) {
    $genArgs += "--dry-run"
}

py -3.11 @genArgs
