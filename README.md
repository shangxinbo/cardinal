# xShadowsocks
## 简述
由于伟大的GFW，国内不能访问全球意义上的互联网，于是有了科学上网这个概念。我的科学上网史是从GAE开始的，后来用自由门，后来发现lantern，一直以为lantern就是最完美的科学上网姿势，然而收费后的lantern似乎偏离了正确的轨道，让我不得不放弃而选择shadowsocks。shadowsocks使用需要部署服务端，也就是需要一个服务器来转发数据，于是你需要有一个免费提供服务的第三方，所以我找到了[ishadowsocks](http://www.ishadowsocks.com) 。而在中国，免费的就代表最贵的，你不得不抽出最宝贵的时间来频繁的更新帐号等配置，然而一切人类重复的工作都可以用程序来提高效率，于是我写了这个脚本程序xShadowsocks。
## 运行依赖
* windows(win7,win8,win10)
* node.js version 4+
* shadowsocks-windows client version 3.2
## 实现原理
借助ishadowsocks[http://www.ishadowsocks.com]提供的服务器，使用开源shadowsocks的windows版客户端，使用node定时抓取ishadowsocks页面上服务器配置，然后更新本地shadowsocks配置文件并重启客户端。
## 使用方式
* 下载程序包，进入文件目录执行node index
* 如果想在后台运行程序，可以编辑bin/start.bat,将程序所在目录配置成自己的文件目录，以后双击该脚本即可在后台执行。
## 配置说明
