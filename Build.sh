CUR_DIR=`pwd`
NAME_SOURCE="Source"
NAME_BUILD="Build"

echo -e "\e[0;31mBuild DSTEd\e[0m"
echo -e "\e[0;31m---\e[0m"

# Create Build Directory
if [ -d "$CUR_DIR/$NAME_BUILD" ]; then
	mkdir $CUR_DIR/$NAME_BUILD
fi

# Move Source to Build Directory
cp -rf $CUR_DIR/$NAME_SOURCE $CUR_DIR/$NAME_BUILD

# Go to Build and Start NPM
cd $CUR_DIR/$NAME_BUILD
npm install