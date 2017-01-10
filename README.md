# xShadowsocks

一个用node实现的shadowsocks代理，包括socksV5代理包括http代理(支持https)。

相信你来这里之前肯定已经熟知了shadowsocks的历史，没错，这个库的基础思想就是基于shadowsocks，只不过是借助node的另一种实现。同样的shadowsocks实现还有很多，详见 [shadowsocks家族](https://github.com/shadowsocks) 。

@clowwindy的另一个[node实现](https://github.com/shadowsocks/shadowsocks-nodejs)已经在两年前停止维护了，原因据作者所说内存较之python而言消耗太大。当然性能是一方面。在此之前我一直使用shadowsocks-windows,不过他的负载均衡和高可用经常在我这里出现问题，为了能够不用频繁的重启，我决定用自己的方式实现我想要的高可用，因为毕竟是工具而已，工具是为了方便使用而不是因为使用工具而让自己的工作的思路经常被打断。

同样的node实现有@oyyd的[shadowsocks-js](https://github.com/oyyd/shadowsocks-js)。xShadowsocks中很多代码借鉴了该库。

## 运行依赖
* [node > v4](https://nodejs.org/en/)

## 使用前说明

* v1,v2 借助shadowsocks-windows，v3 单node解决方案


* 自动抓取4个免费shadowsocks账号平台账号，参考shadowsocks-windows对其进行高可用和负载均衡


* http代理方面借鉴[@m31271n/jet](https://github.com/m31271n/jet)
* 使用GeoIp形成pac文件而放弃使用gfwlist黑名单形式
* 修改windows系统代理的方式借鉴Lantern的实现方式，修改注册表


## 安装使用

```
npm install shangxinbo/xShadowsocks
node bin/app
```

## 配置说明

* config/GeoIP-CN     国内Ip地址

* config/local.json     本地代理的相关配置

  > * host: 代理主机
  > * proxyPortCeil: TCP 端口的最小值，由于会建立多个tcpserver，依据这个值进行分配端口
  > * httpPort: http代理的端口
  > * pacPort: pac服务的端口

* config/pac.js  pac的函数方法

* config/server.json    shadowsocks 服务端地址列表配置，程序会自动更新

其次，spider抓取地址模块，每个项的配置格式必须要遵守规则：每个item需要有url和deXml属性，其中url是抓取地址，deXml是解析函数，deXml参数是抓取的buffer，返回值是一个配置的数组或null，示例如下

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

## 备注
* 所有免费的科学上网手段都是不可靠的，使用时需要使用者谨记安全问题
* 所有科学上网方式都不能保证永久有效，而保证这种方式尽量长久的方法就是多找些备用的免费服务提供商
* 感谢开源项目<code>[shadowsocks-windows](https://github.com/shadowsocks/shadowsocks-windows)</code>
* 开源协议 [GPL](LICENSE)

## 知识储备

* [WPAD 的原理及实现](https://www.ibm.com/developerworks/cn/linux/1309_quwei_wpad/)
* [PAC Functions](http://findproxyforurl.com/pac-functions/)
* [Windows上利用Python自动切换代理IP的终极方案！](https://segmentfault.com/a/1190000004315166)
* [In Windows 7, how to change proxy settings from command line?](https://superuser.com/questions/419696/in-windows-7-how-to-change-proxy-settings-from-command-line)
* [shadowsocks cipher](http://shadowsocks.org/en/spec/cipher.html)
* [SOCKS Protocol Version 5](https://www.ietf.org/rfc/rfc1928.txt)
* [电子前哨基金会](https://www.eff.org/)
* [Tor](https://www.torproject.org/index.html)
* [mocha](https://github.com/mochajs/mocha)
* [chai](https://github.com/chaijs/chai)
* [HTTP 代理原理及实现](https://imququ.com/post/web-proxy.html)