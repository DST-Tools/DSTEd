$cd = Get-Location
$sourcedir = "$cd\Source"
$builddir = "$cd\Build"
$tempdir = "$cd\Temp"

#echo "Build requires NPM"
echo "Cleaning"
del -Recurse "$tempdir\*"
del -Recurse "$builddir\*"
md -Confirm $builddir
md -Confirm $tempdir
echo "copy items to temp"
Copy-Item -Recurse  "$sourcedir\*" "$tempdir\"

cd $tempdir
echo "install necessary javascript modules"
npm install
copy "$tempdir\build\Release\*.node" "$tempdir\Library\win64"
echo "Build Start"
$temp = """$tempdir"""
electron-packager.cmd $temp DSTEd --electronVersion="4.0.2" --asar --overwrite --arch=x64  --icon="$tempdir\Resources\window_icon.ico" --app-version="1.0.0" --win32metadata.CompanyName="DSTEd - OpenSource" --win32metadata.ProductName="DSTEd" --win32metadata.OriginalFilename="DSTEd.exe"
echo "delete unused files"
cd $cd
#foreach($file in $unused)
#{
#    del -Confirm "$builddir\$file"
#}
echo "delete temp files"
del "$tempdir\*"
pause
cls