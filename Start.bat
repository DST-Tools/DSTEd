@echo OFF
set CUR_DIR="%CD%"
set NAME_SOURCE="Source"

SETLOCAL EnableDelayedExpansion
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
	set "DEL=%%a"
)

call :ColorText 0C "Start DSTEd"
echo.
call :ColorText 0C "---"
echo.
echo.

call :ColorText 1C "...Change directory to %NAME_SOURCE%"
echo.
cd %CUR_DIR%\%NAME_SOURCE%

call :ColorText 1C "...installing depencies"
echo.
call npm install

call :ColorText 1C "...starting software"
call npm start


goto :eof

:ColorText
echo off
<nul set /p ".=%DEL%" > "%~2"
findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" > nul 2>&1
goto :eof

pause