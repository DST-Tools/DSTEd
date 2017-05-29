CUR_DIR=`pwd`
NAME_SOURCE="Source"
NAME_BUILD="Build"

echo -e "\e[0;31mBuild DSTEd\e[0m"
echo -e "\e[0;31m---\e[0m"

# Create Build Directory
if [ -d "$CUR_DIR/$NAME_BUILD" ]; then
	mkdir $CUR_DIR/$NAME_BUILD
fi

# Clean-Up Source Folder
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
cp -rf $CUR_DIR/$NAME_SOURCE $CUR_DIR/$NAME_BUILD

# Go to Build and Start NPM
cd $CUR_DIR/$NAME_BUILD
npm install