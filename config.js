/**
 * NAME 2016/9/6
 * DATE 2016/9/6
 * AUTHOR shangxinbo
 */

module.exports = {
    app:{
        "language":"./i18n/cn",
        "log_file":"work.log",
        "ishadowsocks_url":"http://www.ishadowsocks.org/",
        "interval":10,
        "exe_path":"./shadowsocks/"
    },
    shadowsocks:{    //shadowsocks 基础配置 default
        "configs": [],
        "strategy": "com.shadowsocks.strategy.ha",   //默认配置成高可用
        "index": -1,                                 //默认配置成高可用
        "global": false,
        "enabled": true,
        "shareOverLan": true,
        "isDefault": false,
        "localPort": 1080,
        "pacUrl": null,
        "useOnlinePac": false,
        "availabilityStatistics": false,
        "autoCheckUpdate": true,
        "isVerboseLogging": false,
        "logViewer": null,
        "useProxy": false,
        "proxyServer": null,
        "proxyPort": 0
    }
};