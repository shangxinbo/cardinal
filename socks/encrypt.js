"use strict";

const crypto = require('crypto');
const logger = require('../utils/logger');

const hasOwnProperty = {}.hasOwnProperty;

const cryptoParamLength = {
    'aes-128-cfb': [16, 16],
    'aes-192-cfb': [24, 16],
    'aes-256-cfb': [32, 16],
    'bf-cfb': [16, 8],
    'camellia-128-cfb': [16, 16],
    'camellia-192-cfb': [24, 16],
    'camellia-256-cfb': [32, 16],
    'cast5-cfb': [16, 8],
    'des-cfb': [8, 8],
    'idea-cfb': [16, 8],
    'rc2-cfb': [16, 8],
    'rc4': [16, 0],
    'rc4-md5': [16, 16],
    'seed-cfb': [16, 16],
};

const keyCache = {};

function getParamLength(methodName) {
    return cryptoParamLength[methodName];
}

function getMD5Hash(data) {
    return crypto.createHash('md5').update(data).digest();
}

/**
 * @method 生成密钥
 * @param method String  加密算法
 * @param secret String  明文密码
 * return hash
 * */
function getKey(method, secret) {
    const secretBuf = new Buffer(secret, 'utf8');
    const tokens = [];
    const keyLength = getParamLength(method)[0];
    const cacheIndex = `${method}_${secret}`;

    let i = 0;
    let hash;
    let length = 0;

    if (hasOwnProperty.call(keyCache, cacheIndex)) {
        return keyCache[cacheIndex];
    }

    if (keyLength) {
        while (length < keyLength) {
            hash = getMD5Hash((i === 0) ? secretBuf : Buffer.concat([tokens[i - 1], secretBuf]));
            tokens.push(hash);
            i += 1;
            length += hash.length;
        }
        hash = Buffer.concat(tokens).slice(0, keyLength);
        keyCache[cacheIndex] = hash;
        return hash;
    } else {
        logger.error('unsupported method');
    }
}

/**
 * @method 加密数据
 * @param secret String  加密密钥
 * @param method String  加密算法
 * @param data  buffer   原始数据
 * @param _iv  number    偏移量
 * @return  cipher       Cipher实例
 *
 */
exports.createCipher = function (secret, method, data, _iv) {
    const key = getKey(method, secret);
    const iv = _iv || crypto.randomBytes(getParamLength(method)[1]);
    const cipher = crypto.createCipheriv(method, key, iv);

    return {
        cipher,
        data: Buffer.concat([iv, cipher.update(data)])
    };
};

exports.createDecipher = function (secret, methodName, initialData) {
    const ivLength = getParamLength(methodName)[1];
    const iv = initialData.slice(0, ivLength);

    if (iv.length !== ivLength) {
        return null;
    }

    const key = getKey(methodName, secret);
    const decipher = crypto.createDecipheriv(methodName, key, iv);
    const data = decipher.update(initialData.slice(ivLength));

    return {
        decipher,
        data
    };
}