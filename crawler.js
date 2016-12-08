/**
 * NAME 2016/9/6
 * DATE 2016/9/6
 * AUTHOR shangxinbo
 */

'use strict';

const cheerio = require("cheerio");

/**
 * 每个item 需要遵循以下格式，添加或修改时最好复制原有样例进行修改
 * 需要有url和deXml属性
 * @attr url String  抓取路径
 * @function deXml   解析抓取结果转换成shadowsocks的配置项, param body return array or null
 */
const items = [
    /*{
        url: 'http://freessr.top/',
        deXml: function (body) {
            try {
                let $ = cheerio.load(body);
                let list = $('.col-md-6.text-center');
                let arr = [];
                for (let i = 0; i < list.length - 1; i++) {
                    arr.push({
                        "server": $(list[i]).find('h4').eq('0').html().split(':')[1],
                        "server_port": $(list[i]).find('h4').eq('1').html().split(':')[1],
                        "password": $(list[i]).find('h4').eq('2').html().split(':')[1],
                        "method": $(list[i]).find('h4').eq('3').html().split(':')[1],
                        "remarks": "frss",
                        "auth": false
                    });
                }
                return arr;
            } catch (e) {
                return null;
            }
        }
    },*/
    {
        url: 'https://www.ishadowsocks.biz/',
        deXml: function (body) {
            try {
                let $ = cheerio.load(body);
                let list = $('#free .col-sm-4');
                let arr = [];
                for (let i = 0; i < list.length; i++) {
                    arr.push({
                        "server": $(list[i]).find('h4').eq('0').html().split(':')[1],
                        "server_port": $(list[i]).find('h4').eq('1').html().split(':')[1],
                        "password": $(list[i]).find('h4').eq('2').html().split(':')[1],
                        "method": $(list[i]).find('h4').eq('3').html().split(':')[1],
                        "remarks": "iss",
                        "auth": false
                    });
                }
                return arr;
            } catch (e) {
                return null;
            }
        }
    },
    {
        url: 'http://freevpnss.cc/',
        deXml: function (body) {
            try {
                let $ = cheerio.load(body);
                let list = $('#shadowsocks').next('.row.text-center').find('.panel-body');
                let arr = [];
                for (let i = 0; i < list.length; i++) {
                    arr.push({
                        "server": $(list[i]).find('p').eq('0').html().replace(/&#x(.*);/g, ''),
                        "server_port": $(list[i]).find('p').eq('1').html().replace(/&#x(.*);/g, ''),
                        "password": $(list[i]).find('p').eq('2').html().replace(/&#x(.*);/g, ''),
                        "method": $(list[i]).find('p').eq('3').html().replace(/&#x(.*);/g, ''),
                        "remarks": "fvss",
                        "auth": false
                    });
                }
                return arr;
            } catch (e) {
                return null;
            }
        }
    }
];

module.exports = items;