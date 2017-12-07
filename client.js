var net = require('net');
var client = net.connect({port: 52917});
var socketIo = require('socket.io-client');

var SOCKET_IO_SERVER = 'http://localhost:5000';



var io = socketIo(SOCKET_IO_SERVER);

client.on('data', function(data) {
    console.log('data event !!');
    io.sockets.emit('client-');
});

client.on('connect', function () {
    console.log('connect !' + new Date());
});

client.on('close', function () {
    console.log('close !! : ' + new Date());
});