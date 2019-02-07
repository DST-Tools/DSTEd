#include "svlaunchdll_jswrap.h"
//#include <filesystem>

void init(v8::Handle<v8::Object> exports)
{
	//filesystem::path test;
	jsexport::SV_warpper::init(exports);
}

NODE_MODULE(addon, init)//node dll register