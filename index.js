/* ============== Packet Interface ============== */

/* ======================= Config 부분 ========================= */
/* socket io import */
var app                 = require('express');
var http                = require('http').Server(app);
var io                  = require('socket.io')(http);

/* TCP import */
var net                 = require('net');
var server              = net.createServer();

/* 로그 파일을 만들기 위한 모듈 */
var fs                  = require('fs');
var path                = require('path');
var readfiles           = require('readfiles');

var TCP_PORT            = 9000;
var IO_PORT             = 5000;

var tcps                = [];   // 연결되어있는 TCP 소켓 그룹
var clients             = [];
var client_connector    = 0;    // 현재 WEB 측 커넥터 수
var device_connector    = 0;    // 현재 장비 측 커넥터 수
/* END - ======================= Config 부분 ========================= */

/* 데이터 객체 */
var data_object = {

};

var log_object = {
    remoteAddress: null,
    remotePort: null
}

/* 데이터 객체 END */

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

/* 클라이언트 -> 장비 커넥터 */
io.on('connection', function (socket) {
    client_connector++;
    var handshake = socket.handshake;
    clients.push({id: socket.id ,address: handshake.address });
    get_connect();

    /* 이벤트 처리 */

    // 신규접속 이벤트 처리
    socket.emit('UserConnect');

    socket.on('send-packet', function (data) {
        writeFile('client', JSON.stringify(data));
        tcps.forEach(function (client) {
            client.write(data);
        });
        io.emit('send-packet-bind', data);
    })

    socket.on('read-log', function () {
        readDirList();
    })

    socket.on('disconnect', () => {
        client_connector--;
        var socketId = clients.findIndex((item) => { return item.id == socket.id});
        clients.splice(socketId, 1);
        get_connect();
    })

    socket.on('get-connect-count', () => {
        io.emit('response', { device: device_connector, client: client_connector });
    })
});


/* TCP */
/* 장비 -> 클라이언트 커넥터 */
server.on('connection', function (socket) {
    device_connector++;
    tcps.push({ ip: socket.remoteAddress, port: socket.remotePort});
    get_connect();

    socket.on('data', function (data) {
        log_object.remoteAddress = socket.remoteAddress;
        log_object.remotePort = socket.remotePort;
        var _data = data + '\n\n' + JSON.stringify(log_object);
        writeFile('device', _data);
        readDirList();

        
        // 장비 -> 클라이언트
        io.emit('receive-packet', data.toString());
    })

    socket.on('close', function () {
        device_connector--;
        var socketPort = tcps.findIndex((item) => { return item.port == socket.remotePort});
        tcps.splice(socketPort, 1);
        get_connect();
        console.log('TCP Disconnect: ' + device_connector);
    })
});



io.on('send-packet', function () {
    console.log('recevive packet !');
});

function get_connect() {
    io.emit('response-connect-count', { device: device_connector, client: client_connector, device_info: tcps, client_info: clients});
}

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


    fs.writeFile(filename, data, function (err) {
        console.log(getNowTime() + '에 로그 기록!');
    })
}
