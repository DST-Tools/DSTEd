//using native C++ module
module.exports =
(
    function SV()
    {
        const SVLaunchDLL = require('bindings')('SVLaunchDLL.node');
        var SVLaunchDll = new addon.jsexports.SV_wrapper;
        this.init = function ()
        {
            SVLaunchDll_CALL = SVLaunchDLL.exports;
        }
    }
);
