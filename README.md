# cardinal
[![npm](https://img.shields.io/npm/v/cardinalis.svg?style=flat-square)](https://www.npmjs.com/package/cardinalis)
[![Travis](https://img.shields.io/travis/shangxinbo/cardinal.svg?style=flat-square)](https://travis-ci.org/shangxinbo/cardinal)
[![Codecov branch](https://img.shields.io/codecov/c/github/shangxinbo/cardinal/master.svg?style=flat-square)](https://codecov.io/gh/shangxinbo/cardinal/branch/3.0)

A shadowsocks client by nodejs, include socks proxy and http proxy

## why another 
@clowwindy was asked to delete all the shadowsocks code,and shadowsocks-R's cribbing, and lantern start charging a fee. Because of that, I made it. 
* [shadowsocks-nodejs](https://github.com/shadowsocks/shadowsocks-nodejs) stop update
* [shadowsocks-js](https://github.com/oyyd/shadowsocks-js) no http proxy,and no high availability
* [shadowsocks-windows](https://github.com/shadowsocks/shadowsocks-windows) can't auto config and can't meet me
* surport Windows(win7+),MacOS

## model
![model pic](https://raw.githubusercontent.com/shangxinbo/cardinal/master/model.png)

## dependent
* [node > v4](https://nodejs.org/en/)

## achieve
* [jet](https://github.com/m31271n/jet)

* use GeoIp to pac file not use gfwlist

* encrypt type filter by shadowsocks and node surport 

    >|method | size and length|
    >|-------|----------------|
    >|aes-128-ctr | [16, 16]  |
    >|aes-192-ctr | [24, 16]  |
    >|aes-192-ctr | [24, 16]  |
    >|aes-256-ctr | [32, 16]  |
    >|aes-128-cfb | [16, 16]  |
    >|aes-192-cfb | [24, 16]  |
    >|aes-256-cfb | [32, 16]  |
    >|bf-cfb      | [16, 8]   |
    >|camellia-128-cfb | [16, 16]|
    >|camellia-192-cfb | [24, 16]|
    >|camellia-256-cfb | [32, 16]|
    >|cast5-cfb   | [16, 8]   |
    >|des-cfb     | [8, 8]    |
    >|idea-cfb    | [16, 8]   |
    >|rc2-cfb     | [16, 8]   |
    >|salsa20     | [32, 8]   |
    >|seed-cfb    | [16, 16]  |
    

## install  
```
npm install -g cardinalis
```
## CLI
Use cardinal to start in CLI
### options
* upip
* sc

### examples
default start
```
$ cardinal
``` 
start with update GeoIp-CN(IPs in china)
``` 
$ cardinal upip
```
start by closing the auto spider.That use your own server.json(server config) 
```
$ cardinal sc
```
## configs
### normal
* config/GeoIP-CN    ------   IPs in china 
* config/local.json  ------   host and port config
  * host
  * proxyPortCeil  ----   socks port min
  * httpPort
  * pacPort
  * allowDelay     ----   optimal timeout
* config/pac.js      ------   pac file functions
* config/server.json ------   shadowsocks server and password,types

### spider rules
In spider/source.js, all shadowsocks server nodes item list.You can add/edit/delete them.cardinal use this to make tunnel.if you have a shadowsocks server,you can use sc start option.
* url spider webpage url.
* deXml DOM analyse function, param is a buffer,return a array/null.

example like this:
```
{
    url: 'https://freessr.xyz/',
    deXml: function (body) {
        try {
            let $ = cheerio.load(body);
            let list = $('.col-md-6.text-center');
            let arr = [];
            for (let i = 0; i < list.length - 1; i++) {
                if (ciphers[$(list[i]).find('h4').eq('3').html().split(':')[1]]) {
                    arr.push({
                        "host": $(list[i]).find('h4').eq('0').html().split(':')[1],
                        "port": $(list[i]).find('h4').eq('1').html().split(':')[1],
                        "password": $(list[i]).find('h4').eq('2').html().split(':')[1],
                        "method": $(list[i]).find('h4').eq('3').html().split(':')[1],
                        "remarks": "frss",
                        "auth": false
                    });
                }
            }
            return arr;
        } catch (e) {
            return null;
        }
    }
}
```

## license
* [GPL](LICENSE)

## other
* [shadowsocks](https://github.com/shadowsocks)
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
* [SSR的讨论](https://github.com/shadowsocks/shadowsocks-windows/issues/293)
* [SSR的讨论](https://github.com/breakwa11/shadowsocks-rss/issues/28)
* [纪念ss,向一个伟大的创造告别](https://www.starduster.me/2015/08/21/say-goodbye-to-ss/)
* [Shadowsocks 的前世后生](http://chinadigitaltimes.net/chinese/2016/08/gfw-blog%EF%BD%9Cshadowsocks-%E7%9A%84%E5%89%8D%E4%B8%96%E5%90%8E%E7%94%9F/)
* [MacOS set pac](https://support.apple.com/kb/PH18553?locale=zh_CN)
