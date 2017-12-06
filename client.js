var net = require('net');
var client = net.connect({port: 62420});

client.on('data', function(data) {
    console.log('data event !!');
    console.log(data);
});

client.on('connect', function () {
    console.log('connect !' + new Date());
});

client.on('close', function () {
    console.log('close !! : ' + new Date());
});