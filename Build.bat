@echo OFF

set CUR_DIR="%CD%"
set NAME_SOURCE="Source"
set NAME_BUILD="Build"

SETLOCAL EnableDelayedExpansion
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
	set "DEL=%%a"
)

call :ColorText 0C "Build DSTEd"
echo.
call :ColorText 0C "---"
echo.
echo.

:: Create Build Directory
if not exist %CUR_DIR%\%NAME_BUILD% md "%CUR_DIR%\%NAME_BUILD%\"

:: Clean-Up Source Folder
if exist "%CUR_DIR%\%NAME_SOURCE%\npm-debug.log.*<" del /s %CUR_DIR%\%NAME_SOURCE%\npm-debug.log.*
if exist "%CUR_DIR%\%NAME_SOURCE%\config.json" del %CUR_DIR%\%NAME_SOURCE%\config.json
if exist "%CUR_DIR%\%NAME_SOURCE%\node_modules" rmdir /s/q %CUR_DIR%\%NAME_SOURCE%\node_modules

:: Move Source to Build Directory
@RD /S /Q %CUR_DIR%\%NAME_BUILD%
xcopy /e /v %CUR_DIR%\%NAME_SOURCE% %CUR_DIR%\%NAME_BUILD%

:: Go to Build and Start NPM
cd %CUR_DIR%\%NAME_BUILD%
npm install

goto :eof

:ColorText
echo off
<nul set /p ".=%DEL%" > "%~2"
findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" > nul 2>&1
goto :eof

pause