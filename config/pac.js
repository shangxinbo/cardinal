
function FindProxyForURL(url, host){
    if(isPlainHostName(host)){
        return "DIRECT;";
    }else if(isInNet(host, "10.0.0.0", "255.0.0.0") ||isInNet(host, "172.16.0.0",  "255.240.0.0") ||isInNet(host, "192.168.0.0",  "255.255.0.0") ||isInNet(host, "127.0.0.0", "255.255.255.0")) {
        return "DIRECT";
    }else if(inNets(host)){
        return "DIRECT;";
    }else{
        return proxy;
    }
}

function inNets(host){
    for(var i=0;i<ipsArr.length;i++){
        if(isInNet(host,ipsArr[i].ip,ipsArr[i].mask)){
            return true;
        }
    }
    return false;
}