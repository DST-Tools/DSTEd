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

:: Create Build & Temp Directory
call :ColorText 1C "...Remove old Directorys"
::if exist "%CUR_DIR%\%NAME_TEMP%" rmdir /s/q %CUR_DIR%\%NAME_TEMP%
::if exist "%CUR_DIR%\%NAME_BUILD%" rmdir /s/q %CUR_DIR%\%NAME_BUILD%

call :ColorText 1C "...Create Build Directory"
md "%CUR_DIR%\%NAME_BUILD%\"

:: Clean-Up Source Folder
::if exist "%CUR_DIR%\%NAME_SOURCE%\npm-debug.log.*<" del /s %CUR_DIR%\%NAME_SOURCE%\npm-debug.log.*
::if exist "%CUR_DIR%\%NAME_SOURCE%\config.json" del %CUR_DIR%\%NAME_SOURCE%\config.json
::if exist "%CUR_DIR%\%NAME_SOURCE%\node_modules" rmdir /s/q %CUR_DIR%\%NAME_SOURCE%\node_modules

:: Move Source to Build Directory
call :ColorText 1C "...Move Source"
@RD /S /Q %CUR_DIR%\%NAME_TEMP%
xcopy /e /v %CUR_DIR%\%NAME_SOURCE% %CUR_DIR%\%NAME_TEMP%

:: Go to Temp and Start NPM for installing Depencies
cd %CUR_DIR%\%NAME_TEMP%
call :ColorText 1C "...Install Depencies"
npm install

:: Create Software
call :ColorText 1C "...Package Application"
electron-packager %CUR_DIR%\%NAME_TEMP% DSTEd --asar=true --overwrite --prune=true --icon=%CUR_DIR%\%NAME_TEMP%\Resources\window_icon.ico --app-version=1.0.0 --out %CUR_DIR%\%NAME_BUILD% --win32metadata.CompanyName="DSTEd - OpenSource" --win32metadata.ProductName="DSTEd" --win32metadata.OriginalFilename="DSTEd.exe"

:: Remove unused files
call :ColorText 1C "...Remove unused Files"



goto :eof

:ColorText
echo off
<nul set /p ".=%DEL%" > "%~2"
findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" > nul 2>&1
goto :eof

pause