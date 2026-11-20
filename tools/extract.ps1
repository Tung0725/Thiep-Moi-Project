# ==============================================================================
# Wedding Template Extractor Runner (PowerShell)
# ==============================================================================

[CmdletBinding()]
param (
    [Parameter(Position = 0)]
    [string]$Source = "..\my-archiving-session",

    [Parameter(Position = 1)]
    [string]$Output = "..\extracted_templates",

    [switch]$Mirror,
    [switch]$IncludeTrackers
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PythonScript = Join-Path $ScriptDir "extract_template.py"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   Wedding Template Extractor (WARC / WACZ)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "[*] Source: $Source" -ForegroundColor Yellow
Write-Host "[*] Output: $Output" -ForegroundColor Yellow

$Params = @("$PythonScript", "$Source", "-o", "$Output")

if ($Mirror) {
    $Params += "--mirror"
}
if ($IncludeTrackers) {
    $Params += "--include-trackers"
}

py $Params

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[OK] Trích xuất dữ liệu thành công!" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Quá trình trích xuất thất bại." -ForegroundColor Red
}
