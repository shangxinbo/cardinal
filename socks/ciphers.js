/**
 * Look at https://shadowsocks.org/en/spec/cipher.html
 * & filter by node crypto surport only 
 * shadowsocks disabled/removed [table,rc4]
 * node not surport [chacha20,chacha20-ietf,rc4-md5]
*/
module.exports = {
    'aes-128-ctr': [16, 16],
    'aes-192-ctr': [24, 16],
    'aes-256-ctr': [32, 16],
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
    'salsa20': [32, 8],
    'seed-cfb': [16, 16]
};