const net = require('net');
const server = net.createServer();

const PORT = 9002;
const clients = [];

server.on('connection',function (socket) {
    console.log('connect');
    if ( clients.indexOf(socket) == -1 ) {
        clients.push(socket);
    }

    console.log(socket.remoteAddress);
    console.log(socket.remotePort);
    console.log(net.isIPv6(socket.remoteAddress));
});

server.listen(PORT);