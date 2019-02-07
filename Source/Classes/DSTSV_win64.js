//used native C++ addon
//may be the code page is 936
module.exports =
(
    function SV()
    {
        //native C++ code in /Source/cpp-addon
        const SVLaunchDLL = require('../Library/win64/SVLauncherDLL.node');
        var sv = new exports.sv_js;
        var theParam = ['Cluster_1', 'Master', null, null, null, null, null, null, null, true, false];
        //if you want to terminte a server process, just delete the sv_js class.I will explain why in chinese
        //封装的js_sv析构的同时会析构原生的SV，而C++标准类 SV 的析构函数会杀服务器进程

        //sv_js exports 4 functions:
        //setcluster()
        //setdir()
        //setparam()
        //startsv()

        this.init = function ()
        {
            //do nothing
        }
        this.setcluster = sv.setcluster();
        this.setdir = sv.setdir();
        this.startsv = sv.startsv();
        this.setparam = sv.setparam();
    }
);
