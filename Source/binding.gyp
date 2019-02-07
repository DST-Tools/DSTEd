{
	"targets":
	[
		{
			"target_name":"SVLaunchDLL",
			"sources" :
			[
				"cpp-addon\\svlaunchdll.cc"
			],
			 "include_dirs" : 
			[ 
				"<!(node -e \"require('nan')\")"
				"Library/win64/SVLaunchDLL.lib"
			],
		},
	]
}