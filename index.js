/* ============== Packet Interface ============== */
class Packets {

}

/* ======================= Config 부분 ========================= */
/* socket io import */
var app = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* TCP import */
var net = require('net');
var server = net.createServer();

var TCP_PORT = 3000;
var IO_PORT = 5000;

var clients = []; // 이전 소켓의 그룹
/* END - ======================= Config 부분 ========================= */

/* ====================== 서버 생성 부분 ====================== */
/* Socket IO Server Run */
http.listen(IO_PORT, function () {
    console.log('Socket Io Server running at : ' + IO_PORT);
});

/* TCP Server Run */
server.listen(TCP_PORT, function () {
    console.log('TCP Server running at : ' + TCP_PORT);
});

/* END - ====================== 서버 생성 부분 ====================== */


/* socket io */
io.on('connection', function (socket) {
    console.log('client connect : Socket IO');
});

/* 클라이언트 -> 장비 커넥터 */
io.sockets.on('connection', function (socket) {
    socket.on('send-packet', function (data) {
        console.log('send-packet 이벤트 !! : ');
        console.log(data.Sync1);
        console.log(' END === send-packet 이벤트 !! === ');
        console.log('io connectoin sockets : ' + clients.length);
        clients.forEach(function (client) {
            var stream_port = client.remotePort;
            console.log('Client -> Device : ' + new Date());

            client.write('adsf');
        });
    })
});

io.on('close', function () {
    console.log('client disconnect\n');
})


/* TCP */
/* 장비 -> 클라이언트 커넥터 */
server.on('connection', function (socket) {
    console.log('client connect : TCP');
    clients.push(socket);
    console.log('socket address : ' + socket.remoteAddress);
    console.log('socket port : ' + socket.remotePort);

    socket.on('data', function (data) {
        console.log('Device -> Client : ' + new Date());
        
        // 장비 -> 클라이언트
        io.sockets.emit('receive-packet', data.toString());
    })
});



io.on('send-packet', function () {
    console.log('recevive packet !');
});