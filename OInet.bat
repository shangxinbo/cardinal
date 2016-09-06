d:
cd d:\xShadowsocks\
taskkill /f /FI "IMAGENAME eq shadowsocks.exe"
forever start -o run.log index.js