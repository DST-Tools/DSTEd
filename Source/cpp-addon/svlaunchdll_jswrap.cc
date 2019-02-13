#include "svlaunchdll_jswrap.h"


//sv Diretory
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

Nan::Persistent<Function> jsexport::SV_warpper::constructor = Nan::Persistent<Function>();

void jsexport::SV_warpper::init(v8::Local<v8::Object> exports)
{
	Isolate* isolate = exports->GetIsolate();
	Local<v8::FunctionTemplate> tpl = Nan::New<FunctionTemplate>(NewClass);
	tpl->SetClassName(String::NewFromTwoByte(isolate, (uint16_t*)L"js-SV"));
	tpl->InstanceTemplate()->SetInternalFieldCount(1);
	//Nan::SetPrototypeMethod(模版,JS侧函数名,函数指针)
	//exports start
	Nan::SetPrototypeMethod(tpl, "startsv", StartSV);
	Nan::SetPrototypeMethod(tpl, "setdir", setDIR);
	Nan::SetPrototypeMethod(tpl, "setcluster", setcluster);
	Nan::SetPrototypeMethod(tpl, "setparam", setparam);
	//exports end
	constructor.Reset(tpl->GetFunction());
	exports->Set(Nan::New("sv_js").ToLocalChecked(), tpl->GetFunction());//register this class in js side
}

void jsexport::SV_warpper::NewClass(const Nan::FunctionCallbackInfo<Value>& args)
{
	Isolate* isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();
	if (args.IsConstructCall())
	{
		if (args[0].IsEmpty())
		{
			SV_warpper();
		}
		else
		{
			SV_warpper();
		}
	}
	else
	{
		auto isolate = args.GetIsolate();
		auto context = Context::New(isolate);
		const int argc = 1;
		v8::Local<v8::Value> argv[argc] = { args[0] };
		v8::Local<v8::Function> cons = Nan::New<v8::Function>(SV_warpper::constructor);
		args.GetReturnValue().Set(cons->NewInstance(context, argc, argv).ToLocalChecked());
	}
}

void jsexport::SV_warpper::setcluster(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	if (!(info[0]->IsString()))
	{
		info.GetReturnValue().Set(false);
		return;
	}
	auto theSV = Nan::ObjectWrap::Unwrap<SV_warpper>(info.Holder())->theSV;
	Local<String> src = info[0].As<String>();
	uint16_t* u16src = new uint16_t[src->Length()];
	src->Write(u16src);
	theSV->setcluster((wchar_t*)u16src);
	info.GetReturnValue().Set(true);
}

void jsexport::SV_warpper::StartSV(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	auto theSV = Nan::ObjectWrap::Unwrap<SV_warpper>(info.Holder())->theSV;
	info.GetReturnValue().Set(theSV->StartSV());
}

void jsexport::SV_warpper::setparam(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	auto theSV = Nan::ObjectWrap::Unwrap<SV_warpper>(info.Holder())->theSV;
}

void jsexport::SV_warpper::setDIR(const Nan::FunctionCallbackInfo<v8::Value>& info)
{
	auto theSV = Nan::ObjectWrap::Unwrap<SV_warpper>(info.Holder())->theSV;
	if (!info[0].IsEmpty())
	{
		auto js_dir = (info[0].As<v8::String>());
		auto u16_dir = new uint16_t[js_dir->Length()];
		js_dir->Write(u16_dir);
		theSV->setDIR((wchar_t*)u16_dir);
	};
}

jsexport::SV_warpper::SV_warpper()
{
	theSV = nullptr;
}

jsexport::SV_warpper::~SV_warpper()
{
	theSV = nullptr;
}
