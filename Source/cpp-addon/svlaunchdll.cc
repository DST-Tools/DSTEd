#include <node.h>
#include <v8.h>
#include <nan.h>
#include "SVlaunchDLL.hpp"
using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::NewStringType;
using v8::Number;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;
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
//var theParam = ['Cluster_1', 'Master', 'string', 'string', 'string, 'string', 'string', 'string, null, true, false]
//------------------------------------------------------



namespace jsexport
{
	using namespace SVLaunchDLL;

	class SV_warpper :public Nan::ObjectWrap
	{
	public:
		static void init(v8::Local<v8::Object> exports)
		{
			Isolate* isolate = exports->GetIsolate();
			Local<v8::FunctionTemplate> tpl = v8::FunctionTemplate::New(isolate, NewClass);
			tpl->SetClassName(String::NewFromTwoByte(isolate, (uint16_t*)L"js-SV"));
			tpl->InstanceTemplate()->SetInternalFieldCount(1);

			NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);
		}
	private:
		SV* theSV;

		void NewClass(const FunctionCallbackInfo<Value>& args)
		{
			Isolate* isolate = args.GetIsolate();
			Local<Context> context = isolate->GetCurrentContext();
			if (args.IsConstructCall())
			{
				if (args[0].IsEmpty())
				{
					theSV = new SV;
				}
				else
				{
					theSV = new SV;
					auto js_dir = (args[0].As<v8::String>());
					auto u16_dir = new uint16_t[js_dir->Length()];
					js_dir->Write(u16_dir);
					theSV->setDIR((wchar_t*)u16_dir);
				}
			}
			else
			{
				const int argc = 1;
				Local<Value> argv[argc] = { args[0] };
				Local<Function> cons = Local<Function>::New(isolate, constructor);
				Local<Object> result = cons->NewInstance(context, argc, argv).ToLocalChecked();
				args.GetReturnValue().Set(result);
			}
		}
		void setcluster(Nan::FunctionCallbackInfo<Value> info)
		{
			if (!(info[0]->IsString()))
			{
				info.GetReturnValue().Set(false);
				return;
			}
			Local<String> src = info[0].As<String>();
			uint16_t* u16src = new uint16_t[src->Length()];
			src->Write(u16src);
			theSV->setcluster((wchar_t*)u16src);
			info.GetReturnValue().Set(true);
		}
		BOOL StartSV()
		{
			return theSV->StartSV();
		}
		void setparam(Nan::FunctionCallbackInfo<v8::Value> info) noexcept
		{
			
		}
		//WINAPI, startupinfo
		void setSI(Nan::FunctionCallbackInfo<v8::Value> info) noexcept
		{
			
		}
		//sv Diretory
		void setDIR(Nan::FunctionCallbackInfo<v8::Value> info) noexcept
		{
			if (!info[0].IsEmpty())
			{
				auto js_dir = (info[0].As<v8::String>());
				auto u16_dir = new uint16_t[js_dir->Length()];
				js_dir->Write(u16_dir);
				theSV->setDIR((wchar_t*)u16_dir);
			};
		}
		SV_warpper()
		{
			theSV = nullptr;
		}
		~SV_warpper()
		{
			delete theSV;
		}

		//static SVPARAM tempParam;

		static Nan::Persistent<v8::Function> constructor;//¹¹ÔìÆ÷
	};
};
void init(v8::Handle<Object> exports)
{
	jsexport::SV_warpper::init(exports);
}

NODE_MODULE(addon, init)