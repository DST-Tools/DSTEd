//used native C++ addon
//may be the code page is 936
module.exports =
(
    function SV()
    {
        //native C++ code in /Source/cpp-addon
        const SVLaunchDLL = require('../Library/win64/SVLauncherDLL.node');
        var sv = null;
        var theParam = ['Cluster_1', 'Master', null, null, null, null, null, null, null, true, false];

        //sv_js exports 4 functions:
        //setcluster()
        //setdir()
        //setparam()
        //startsv()

        this.init = function ()
        {
            sv = new SVLaunchDLL;
        }
        this.setcluster = sv.setcluster();
        this.setdir = sv.setdir();
        this.startsv = sv.startsv();
        this.setparam = sv.setparam();

        this.termintesv = function () {
            delete sv;
        };
    }
);
