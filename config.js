/**
 * NAME 2016/9/6
 * DATE 2016/9/6
 * AUTHOR shangxinbo
 */

module.exports = {
    app: {
        "language": "./i18n/cn",
        "log_file": "work.log",
        "interval": 30,                               //30分钟刷新服务
        "exe_path": "./shadowsocks/"
    },
    shadowsocks: {        //shadowsocks 基础配置 default
        "configs": [],
        "strategy": "com.shadowsocks.strategy.scbs",   //负载均衡"com.shadowsocks.strategy.balancing"，高可用"com.shadowsocks.strategy.ha"
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