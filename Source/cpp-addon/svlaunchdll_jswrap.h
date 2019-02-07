#include <node.h>
#include <v8.h>
#include <nan.h>
#include "SVlaunchDLL.hpp"

//---------------------------------- C++ 17 Project----------------------------------//

//struct SVPARAM
//{
//	std::wstring cluster = L"Cluster_1"; //wstring also accepts UTF16 array
//	std::wstring shard = L"Master";
//	std::wstring logbackup;
//	std::wstring storage_root;
//	std::wstring confdir;
//	std::wstring tickrate;
//	std::wstring maxplayers;
//	std::wstring SteamID3;
//	std::wstring SteamID64;
//	bool offline = true;
//	bool fo = false;
//};
//------------------------------------------------------
//I think I can declare SVPARAM in JavaScript like this, I may write a parser later:
//var theParam = ['Cluster_1', 'Master', 'string', 'string', 'string, 'string', 'string', 'string', null, true, false]
//------------------------------------------------------

namespace jsexport
{
	using namespace SVLaunch_CPP;
	
	class SV_warpper :public Nan::ObjectWrap
	{
	public:
		static void init(v8::Local<v8::Object> exports);
	private:
		SV* theSV;
		static void NewClass(const Nan::FunctionCallbackInfo<v8::Value>& args);
		static void setcluster(const Nan::FunctionCallbackInfo<v8::Value>& info);
		static void StartSV(const Nan::FunctionCallbackInfo<v8::Value>& info);
		static void setparam(const Nan::FunctionCallbackInfo<v8::Value>& info);
		//sv Diretory
		static void setDIR(const Nan::FunctionCallbackInfo<v8::Value>& info);
		SV_warpper();
		~SV_warpper();
		static Nan::Persistent<v8::Function> jsexport::SV_warpper::constructor;//JS¹¹ÔìÆ÷,C++17
	};
	
};
