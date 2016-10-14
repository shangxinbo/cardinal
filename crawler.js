/**
 * NAME 2016/9/6
 * DATE 2016/9/6
 * AUTHOR shangxinbo
 */

'use strict';

const cheerio = require("cheerio");

exports.iss = function(){
    this.url = 'http://www.ishadowsocks.org/';
    this.deXml = function(body){
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
    }
};
exports.fvss = function(){
    this.url = 'http://freevpnss.cc/';
    this.deXml = function(body){
        let $ = cheerio.load(body);
        let list = $('#shadowsocks').next('.row.text-center').find('.panel-body');
        let arr = [];
        for (let i = 0; i < list.length; i++) {
            arr.push({
                "server": $(list[i]).find('p').eq('0').html().split('：')[1],
                "server_port": $(list[i]).find('p').eq('1').html().split('：')[1],
                "password": $(list[i]).find('p').eq('2').html().split('：')[1],
                "method": $(list[i]).find('p').eq('3').html().split('：')[1],
                "remarks": "fvss",
                "auth": false
            });
        }
        return arr;
    }
};
exports.tss = function(){
    this.url = 'http://tempss.com/';
    this.deXml = function(body){
        let $ = cheerio.load(body);
        let list = $('table.table-responsive tr');
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
    }
};
exports.frss = function(){
    this.url = 'http://freessr.top/';
    this.deXml = function(body){
        let $ = cheerio.load(body);
        let list = $('.col-md-6.text-center');
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
    }
};