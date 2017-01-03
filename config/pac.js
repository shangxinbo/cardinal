
function FindProxyForURL(url, host){
    if(inNets(host)){
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