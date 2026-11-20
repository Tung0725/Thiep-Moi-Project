@echo off
setlocal
chcp 65001 >nul

echo =======================================================
echo   Wedding Template Extractor (WARC / WACZ)
echo =======================================================

set SOURCE=%~1
if "%SOURCE%"=="" set SOURCE=..\my-archiving-session

set OUTPUT=%~2
if "%OUTPUT%"=="" set OUTPUT=..\extracted_templates

echo [*] Nguon: %SOURCE%
echo [*] Thu muc xuat: %OUTPUT%
echo.

py "%~dp0extract_template.py" "%SOURCE%" -o "%OUTPUT%" %*

if %ERRORLEVEL% equ 0 (
    echo.
    echo [OK] Hoan tat trich xuat du lieu thanh cong!
) else (
    echo.
    echo [ERROR] Co loi xay ra trong qua trinh chay tool.
)

endlocal
