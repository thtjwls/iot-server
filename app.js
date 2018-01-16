const app = require('./server');
const io = app.io;
const server = app.server;
const eventer = require('./modules/connectionEventer')(io);
const util = require('./modules/utility')();

io.on('connection', () => {
    console.log('User Connect IO');
    eventer.getConnection();
});

server.on('connection', socket => {

    eventer.addConnection(socket);

    socket.on('data', data => {

        eventer.postData('http://115.71.233.41:8080/api/packet', {
            ip: socket.remoteAddress,
            port: socket.remotePort,
            data: util.buffer_decode(data)
        });
    })

    socket.on('end', () => {
        console.log(`Socket ON Disconnect`);
        eventer.deleteConnection(socket);
    });
});