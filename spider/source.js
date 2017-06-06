/**
 * 每个item 需要遵循以下格式，添加或修改时最好复制原有样例进行修改
 * 需要有url和deXml属性
 * @param {String} url  抓取路径
 * @param {function} deXml   to resolve socks server configs
 */
const cheerio = require('cheerio')
const ciphers = require('../socks/ciphers')

const items = [
    {
        url: 'https://freessr.xyz/',
        deXml: function (body) {
            try {
                let $ = cheerio.load(body)
                let list = $('.col-md-6.text-center')
                let arr = []
                for (let i = 0; i < list.length - 1; i++) {
                    if (ciphers[$(list[i]).find('h4').eq('3').html().split(':')[1]]) {
                        arr.push({
                            "host": $(list[i]).find('h4').eq('0').html().split(':')[1],
                            "port": $(list[i]).find('h4').eq('1').html().split(':')[1],
                            "password": $(list[i]).find('h4').eq('2').html().split(':')[1],
                            "method": $(list[i]).find('h4').eq('3').html().split(':')[1],
                            "remarks": "frss",
                            "auth": false
                        })
                    }
                }
                return arr
            } catch (e) {
                return null
            }
        }
    },
    {
        url: 'http://tempss.com/',
        deXml: function (body) {
            try {
                let $ = cheerio.load(body)
                let list = $('#tbody tr')
                let arr = []
                for (let i = 0; i < list.length; i++) {
                    if (ciphers[$(list[i]).find('td').eq('2').html()]) {
                        arr.push({
                            "host": $(list[i]).find('td').eq('0').html(),
                            "port": $(list[i]).find('td').eq('1').html(),
                            "password": $(list[i]).find('td').eq('3').html(),
                            "method": $(list[i]).find('td').eq('2').html(),
                            "remarks": "tss",
                            "auth": false
                        })
                    }
                }
                return arr
            } catch (e) {
                return null
            }
        }
    },
    {
        url: 'http://ss.ishadowx.com/',
        deXml: function (body) {
            try {
                let $ = cheerio.load(body)
                let list = $('.hover-text')
                let arr = []
                for (let i = 0; i < list.length; i++) {
                    if (ciphers[$(list[i]).find('h4').eq('3').text().split(':')[1]]) {
                        if ($(list[i]).find('h4').eq('4').text().length <= 0) {
                            arr.push({
                                "host": $(list[i]).find('h4').eq('0').text().split(':')[1],
                                "port": $(list[i]).find('h4').eq('1').text().split('：')[1],
                                "password": $(list[i]).find('h4').eq('2').text().split(':')[1],
                                "method": $(list[i]).find('h4').eq('3').text().split(':')[1],
                                "remarks": "iss",
                                "auth": false
                            })
                        }
                    }
                }
                return arr
            } catch (e) {
                return null
            }
        }
    },
    {
        url: 'https://get.freevpnss.me/',
        deXml: function (body) {
            try {
                let $ = cheerio.load(body)
                let list = $('#shadowsocks').next('.row.text-center').find('.panel-body')
                let arr = []
                for (let i = 0; i < list.length; i++) {
                    if (ciphers[$(list[i]).find('p').eq('3').html().replace(/&#x(.*);/g, '').toLowerCase()]) {
                        arr.push({
                            "host": $(list[i]).find('p').eq('0').html().replace(/&#x(.*);/g, ''),
                            "port": $(list[i]).find('p').eq('1').html().replace(/&#x(.*);/g, ''),
                            "password": $(list[i]).find('p').eq('2').html().replace(/&#x(.*);/g, ''),
                            "method": $(list[i]).find('p').eq('3').html().replace(/&#x(.*);/g, ''),
                            "remarks": "fvss",
                            "auth": false
                        })
                    }
                }
                return arr
            } catch (e) {
                return null
            }
        }
    }
]

module.exports = items