CUR_DIR=`pwd`
INSTALL_DIR="$HOME/.dsted"
NAME_SOURCE="Source" #this is redundant
#UPDATE=true #if set to true it will attempt to grab the latest version and build the update. not going to work on it

echo "This is the Linux install version."
echo "You need to install nodejs and npm for this to work."

#create the install directory
mkdir $INSTALL_DIR

# copy the things
cp -rf $CUR_DIR/$NAME_SOURCE $INSTALL_DIR/

## Go to Build and Start NPM
cd $INSTALL_DIR/$NAME_SOURCE
npm install
