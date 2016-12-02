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
        "strategy": false,   //当index:-1时起作用，负载均衡"com.shadowsocks.strategy.balancing",高可用"com.shadowsocks.strategy.ha",根据统计"com.shadowsocks.strategy.scbs"
        "index": 0,          //现在的负载均衡和高可用算法等算法有待考究，会影响资源方ip的切换，最好不用
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