{
	"targets":
	[
		{
			"target_name":"SVLaunchDLL",
			"sources" :
			[
				"cpp-addon/svlaunchdll_jswrap.cc",
				"cpp-addon/svlaunchdll_jswrap.h",
				"cpp-addon/SVLaunchDLL.cpp",
				"cpp-addon/SVLaunchDLL.hpp",
				"cpp-addon/dllmain.cc"
			],
			 "include_dirs" : 
			[ 
				"<!(node -e \"require('nan')\")",
				#"Library/win64/SVLaunchDLL.lib",	
			],
			"cflags_cc":
			[
				"/property:LanguageStandard=stdcpp17"
			]
		}
	]
}
