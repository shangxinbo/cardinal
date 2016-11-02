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
        "interval":60,                               //60分钟刷新服务
        "exe_path":"./shadowsocks/"
    },
    shadowsocks:{   //shadowsocks 基础配置 default
        "configs": [],
        "strategy": "com.shadowsocks.strategy.balancing",  //默认配置成负载均衡，高可用配置 com.shadowsocks.strategy.ha
        "index": -1,
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