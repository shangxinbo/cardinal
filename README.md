# xShadowsocks

## 简述
由于伟大的GFW，国内不能访问全球意义上的互联网，于是有了科学上网这个概念。我的科学上网史是从GAE开始的，后来用自由门，后来发现lantern，一直以为lantern就是最完美的科学上网姿势，然而收费后的lantern似乎偏离了正确的轨道，让我不得不放弃而选择shadowsocks。shadowsocks使用需要部署服务端，也就是需要一个服务器来转发数据，于是你需要有一个免费提供服务的第三方，所以我找到了[ishadowsocks](http://www.ishadowsocks.com)，后来依次找到其他的服务提供商。而在中国，免费的就代表最贵的，你不得不抽出最宝贵的时间来频繁的更新帐号等配置，然而一切人类重复的工作都可以用程序来提高效率，于是我写了这个脚本程序xShadowsocks。

## 运行依赖
* <code>windows(win7,win8,win10)</code>
* <code>node.js version 4+</code>
* <code>shadowsocks-windows client version 3.x+</code>

## 实现原理
借助开源项目shadowsocks的windows版客户端，使用网络搜集的免费的shadowsocks服务器节点,定时抓取页面上服务器配置,自动获取账号密码更新本地shadowsocks配置，并重启shadowsocks客户端。
* version 1.0
> 使用ishadowsocks服务节点，自动更新，实现按需最小化操作，更新频率越快服务越稳定但越耗费系统资源。优点：
>* 系统资源消耗小

* version 2.0
> 将服务节点写入crawler.js配置模块，用户可以自定义服务提供商。优点：
>* 抓取服务器节点可配置化，可配置多个被爬取地址
>* 高可用度提高，防止某个提供商被和谐后程序无法使用
>* 更新配置频率可降低
>* 程序配置集中，复杂变简单
>
> version 2.0 默认服务提供商如下
>* http://www.ishadowsocks.org/
>* http://freevpnss.cc/
>* http://tempss.com/
>* http://freessr.top/

## 使用方式
* 下载程序包，执行<code>npm install</code>
* 进入文件目录执行<code>node index</code>
* 如果想在后台运行程序，可以编辑bin/start.bat,将程序所在目录配置成自己的文件目录，以后双击该脚本即可在后台执行,__这里要注意，程序运行会关闭调当前所有正在执行的node程序__

## 配置说明
* shadowsocks目录存放最新的shadowsocks-windows客户端程序
* 模块config.js
* * app 项目配置文件
* * shadowsocks 是shadowsocks的基础配置文件，如果shadowsocks的配置文件随着版本更新不再向下兼容，需要相应的更新该文件
* work.log 是运行的日志文件，当执行程序后发现不能上网可以查看日志查找原因
* i18n是日志的输出语言包，可以自己配置，并通过更改package.json里的配置项进行配置

## 抓取地址编辑
2.0版本可自定义抓取地址，crawler.js 是抓取地址配置模块，每个项的配置格式必须要遵守规则：每个item需要有url和deXml属性，其中url是抓取地址，deXml是解析函数，deXml参数是抓取的buffer，返回值是一个配置的数组或null，示例如下
```
{
    url: 'http://tempss.com/',
    deXml: function (body) {
        try {
            let $ = cheerio.load(body);
            let list = $('table.table-responsive tbody tr');
            let arr = [];
            for (let i = 0; i < list.length; i++) {
                arr.push({
                    "server": $(list[i]).find('td').eq('0').html(),
                    "server_port": $(list[i]).find('td').eq('1').html(),
                    "password": $(list[i]).find('td').eq('2').html(),
                    "method": $(list[i]).find('td').eq('3').html(),
                    "remarks": "tss",
                    "auth": false
                });
            }
            return arr;
        } catch (e) {
            return null;
        }
    }
}
```
## 已知问题
使用谷歌特殊情况下会出现500 Internal Privoxy Error，如下，可通过切换负载均衡和高可用选项解决
```
500 Internal Privoxy Error

Privoxy encountered an error while processing your request:

Could not load template file no-server-data or one of its included components.

Please contact your proxy administrator.

If you are the proxy administrator, please put the required file(s)in the (confdir)/templates directory. The location of the (confdir) directory is specified in the main Privoxy config file. (It's typically the Privoxy install directory).
```

## 备注
* 所有免费的科学上网手段都是不可靠的，使用时需要使用者谨记安全问题
* 所有科学上网方式都不能保证永久有效，而保证这种方式尽量长久的方法就是多找些备用的免费服务提供商
* 开源协议 [GPL](LICENSE)

## 事件记录
* 2016-11-17 下午某刻 ishadowsocks.org域名地址停止服务，改为ishadowsocks.net，感谢ishadowsocks为免费科学上网做出的不懈的努力
* 2016-11-?? 11月某许 tempss.com 服务停止，不明原因，感谢tempss为免费科学上网做出的努力
