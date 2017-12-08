/* ============== Packet Interface ============== */

/* ======================= Config 부분 ========================= */
/* socket io import */
var app = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* TCP import */
var net = require('net');
var server = net.createServer();

/* 로그 파일을 만들기 위한 모듈 */
var fs = require('fs');
var path = require('path');
var readfiles = require('readfiles');

var TCP_PORT = 9000;
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

    /* 이벤트 처리 */
    socket.on('send-packet', function (data) {
        console.log('send-packet 이벤트 !! : ');
        console.log(data.Sync1);
        console.log(' END === send-packet 이벤트 !! === ');
        // console.log('io connectoin sockets : ' + clients.length);
        console.log('Client -> Device : ' + new Date());
        writeFile('client', JSON.stringify(data));

        clients.forEach(function (client) {
            var stream_port = client.remotePort;
            client.write('adsf');
        });
    })

    socket.on('read-log', function () {
        readDirList();
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
        writeFile('device', data);
        readDirList();

        
        // 장비 -> 클라이언트
        io.sockets.emit('receive-packet', data.toString());
    })
});



io.on('send-packet', function () {
    console.log('recevive packet !');
});

function readDirList() {
    fs.readdir(__dirname + '/log/device/', (err, files) => {
        io.sockets.emit('read-log-res', files);
    })
}

function getNowTime() {
    var time = new Date();
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
    var i = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
    var s = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds();

    if ( m < 10 ) { m = '0' + m; }
    if ( d < 10 ) { d = '0' + d; }

    var nowTime = y + '-' + m + '-' + d + 'A' + h + '-' +  i + '-' + s;
    return nowTime;
}

function writeFile(u, data) {

    var filename = 'log/' + u + '/' + getNowTime() + '.txt';

    fs.open(filename, 'w', function (err, fd) {
        if ( err ) throw err;
    });


    fs.writeFile(filename, data, 'utf8', function (err) {
        console.log(getNowTime() + '에 로그 기록!');
        console.log(err);
    })
}
