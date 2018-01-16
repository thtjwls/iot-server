const app = require('express');
const http = require('http');
const httpServer = http.Server(app);
const io = require('socket.io')(httpServer);

const net = require('net');
const server = net.createServer();

const IO_PORT = 5000;
const TCP_PORT = 9000;


/* Http Server 생성 */
httpServer.listen(IO_PORT, () => {
    console.log(`HTTP Server Running At PORT : ${IO_PORT}`);
});



/* Tcp Server 생성 */

const tcp_server = server.listen(TCP_PORT, () => {
    console.log(`TCP Server Running At PORT : ${TCP_PORT}`);
});

module.exports = {
    io: io,
    server: tcp_server
};