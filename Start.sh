CUR_DIR=`pwd`
NAME_SOURCE="Source/"

echo -e "\e[0;31mStart DSTEd\e[0m"
echo -e "\e[0;31m---\e[0m"
cd $CUR_DIR/$NAME_SOURCE

echo -e "\e[31m\e[48;5;17m...installing depencies\033[0m"
npm install

echo -e "\e[31m\e[48;5;17m...starting software\033[0m"
npm start