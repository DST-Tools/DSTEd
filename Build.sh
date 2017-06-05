CUR_DIR=`pwd`
NAME_SOURCE="Source"
NAME_BUILD="Build"
NAME_TEMP="Temp"
UNUSED_FILES=( "blink_image_resources_200_percent.pak" "content_resources_200_percent.pak" "d3dcompiler_47.dll" "libEGL.dll" "libGLESv2.dll" "LICENSE" "LICENSES.chromium.html" "pdf_viewer_resources.pak" "ui_resources_200_percent.pak" "version" "views_resources_200_percent.pak" )

echo -e "\e[0;31mBuild DSTEd\e[0m"
echo -e "\e[0;31m---\e[0m"

# Create Build & Temp Directory
echo -e "\e[31m\e[48;5;17m...Remove old Directorys\033[0m"
if [ -d "$CUR_DIR/$NAME_TEMP" ]; then
	rm -f -r $CUR_DIR/$NAME_TEMP
fi

if [ -d "$CUR_DIR/$NAME_BUILD" ]; then
	rm -f -r $CUR_DIR/$NAME_BUILD
fi

echo -e "\e[31m\e[48;5;17m...Create Build Directory\033[0m"
mkdir $CUR_DIR/$NAME_BUILD

# Clean-Up Source Folder
echo -e "\e[31m\e[48;5;17m...Clean-Up Source Folder\033[0m"
if ls $CUR_DIR/$NAME_SOURCE/npm-debug.log.* 1> /dev/null 2>&1; then
	rm -r $CUR_DIR/$NAME_SOURCE/npm-debug.log.*
fi

if [ -e "$CUR_DIR/$NAME_SOURCE/config.json" ]; then
	rm $CUR_DIR/$NAME_SOURCE/config.json
fi

if [ -d "$CUR_DIR/$NAME_SOURCE/node_modules" ]; then
	rm -f -r $CUR_DIR/$NAME_SOURCE/node_modules
fi

# Move Source to Build Directory
echo -e "\e[31m\e[48;5;17m...Move Source\033[0m"
cp -r $CUR_DIR/$NAME_SOURCE $CUR_DIR/$NAME_TEMP

# Go to Temp and Start NPM for installing Depencies
cd $CUR_DIR/$NAME_TEMP
echo -e "\e[31m\e[48;5;17m...Install Depencies\033[0m"
npm install

# Create Software
echo -e "\e[31m\e[48;5;17m...Package Application\033[0m"

if [[ $BUILD_OS == "all" ]]; then
	electron-packager $CUR_DIR/$NAME_TEMP DSTEd --all --asar=true --overwrite --prune=true --icon=$CUR_DIR/$NAME_TEMP/Resources/window_icon.ico --app-version=1.0.0 --out $CUR_DIR/$NAME_BUILD --win32metadata.CompanyName="DSTEd - OpenSource" --win32metadata.ProductName="DSTEd" --win32metadata.OriginalFilename="DSTEd.exe"
else
	electron-packager $CUR_DIR/$NAME_TEMP DSTEd --asar=true --overwrite --prune=true --icon=$CUR_DIR/$NAME_TEMP/Resources/window_icon.ico --app-version=1.0.0 --out $CUR_DIR/$NAME_BUILD --win32metadata.CompanyName="DSTEd - OpenSource" --win32metadata.ProductName="DSTEd" --win32metadata.OriginalFilename="DSTEd.exe"
fi

# Remove unused files
echo -e "\e[31m\e[48;5;17m...Remove unused Files\033[0m"
for FILE in ${UNUSED_FILES[@]}
do
	if ls $CUR_DIR/$NAME_BUILD/DSTEd-*-*/$FILE 1> /dev/null 2>&1; then
		echo "remove $FILE"
		rm -r $CUR_DIR/$NAME_BUILD/DSTEd-*-*/$FILE
	fi
done

echo -e "\e[31m\e[48;5;17m...Remove Temporary Directory\033[0m"
if [ -d "$CUR_DIR/$NAME_TEMP" ]; then
	rm -f -r $CUR_DIR/$NAME_TEMP
fi

