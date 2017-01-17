const crypto = require('crypto')
const logger = require('../utils/logger')
const ciphers = require('./ciphers')

const hasOwnProperty = {}.hasOwnProperty
const keyCache = {}

/**
 * @method 生成密钥
 * @param {string} method  算法名称
 * @param {string} secret  明文密码
 * @returns key
 * */
function getKey(method, secret) {
    const secretBuf = new Buffer(secret, 'utf8')
    const tokens = []
    const cacheIndex = `${method}_${secret}`
    if (ciphers[method]) {
        const IVLength = ciphers[method][0]
        let i = 0
        let hash
        let length = 0
        if (hasOwnProperty.call(keyCache, cacheIndex)) {
            return keyCache[cacheIndex]
        }
        while (length < IVLength) {
            let buffdata = (i === 0) ? secretBuf : Buffer.concat([tokens[i - 1], secretBuf])
            hash = crypto.createHash('md5').update(buffdata).digest()
            tokens.push(hash)
            i += 1
            length += hash.length
        }
        hash = Buffer.concat(tokens).slice(0, IVLength)
        keyCache[cacheIndex] = hash
        return hash
    } else {
        return null
    }
}

exports.createCipher = function (secret, method, data) {
    const key = getKey(method, secret)
    const rules = ciphers[method]
    if (rules && key) {
        const iv = crypto.randomBytes(rules[1])
        let cipher = crypto.createCipheriv(method, key, iv)
        return {
            cipher,
            data: Buffer.concat([iv, cipher.update(data)])
        }
    } else {
        logger.error('cipher method not support')
        return false
    }
}

exports.createDecipher = function (secret, method, initialData) {
    if (ciphers[method]) {
        const ivLength = ciphers[method][1]
        const iv = initialData.slice(0, ivLength)

        if (iv.length !== ivLength) {
            return null
        }

        const key = getKey(method, secret)
        const decipher = crypto.createDecipheriv(method, key, iv)
        const data = decipher.update(initialData.slice(ivLength))

        return {
            decipher,
            data
        }
    } else {
        logger.error('decipher method not support')
        return false
    }
}