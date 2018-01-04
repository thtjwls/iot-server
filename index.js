/* ============== Packet Interface ============== */
/* ======================= Utilities ======================= */


/* ======================= END Utilities ======================= */

/* 선언부 */
var hub_data            = {
    name: 'other',
    len: 0,
    header: null,
    hub_version: null,
    hub_id: null,
    hcu_id: null,
    dcu_id: null,
    electric: 0,
    water: 0,
    ext1: 0,
    ext2: 0,
    ext3: 0,
    ext4: 0,
}

var hub_omni            = {
    name: 'omni',
    len: 31,
    header: [170, 85],
    version: null,
    hub_id: null,
    hcu_id: null,
    electric: null,
    water: null
}

/* END 선언부 */

/* ======================= Config 부분 ========================= */
/* socket io import */
var app                 = require('express');
var http                = require('http');
var httpServer          = http.Server(app);
var io                  = require('socket.io')(httpServer);
var request             = require('request');

/* TCP import */
var net                 = require('net');
var server              = net.createServer();

/* 로그 파일을 만들기 위한 모듈 */
var fs                  = require('fs');
var path                = require('path');
var readfiles           = require('readfiles');

var TCP_PORT            = 9000;
var IO_PORT             = 5000;

/* API 설정 부분 */
var DB_SERVER           = [];
    DB_SERVER['HOST']   = 'http://127.0.0.1';
    DB_SERVER['PORT']   = '8080';
    DB_SERVER['PATH']   = '/api/packet';
    DB_SERVER['URI']    = `${DB_SERVER['HOST']}:${DB_SERVER['PORT']}${DB_SERVER['PATH']}`;

var REQUEST_HEADER      = {
    'Content-Type': 'application/json',
    'User-Agent':       'Super Agent/0.0.1'
};



var tcps                = [];
tcps['sockets']         = [];   // 연결되어있는 TCP 소켓 그룹
tcps['info']            = [];   // 화면에 표시할 수 있는 tcp 소켓 정보


var clients             = [];

var client_connector    = 0;    // 현재 WEB 측 커넥터 수
var device_connector    = 0;    // 현재 장비 측 커넥터 수
/* END - ======================= Config 부분 ========================= */

var log_object = {
    remoteAddress: null,
    remotePort: null
}

var packet_data = {
    ip: null,
    port: null,
    data: null
}

/* 데이터 객체 END */

/* ====================== 서버 생성 부분 ====================== */
/* Socket IO Server Run */
httpServer.listen(IO_PORT, function () {
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

        tcps['sockets'].forEach(function (client) {

            /** 서버 종료가 일어나지 않도록 try ~ catch 문으로 묶음. **/
            try {
                client.write(data);
            } catch (e) {
                console.log(e);
            }

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
    //tcps.push({ ip: socket.remoteAddress, port: socket.remotePort});
    //tcps.push(socket);
    tcps['sockets'].push(socket);
    tcps['info'].push({ ip: socket.remoteAddress, port: socket.remotePort});

    get_connect();

    socket.on('data', function (data) {

        packet_data.ip = socket.remoteAddress;
        packet_data.data = buffer_decode(data);
        packet_data.port = socket.remotePort;

        var options = {
            url: DB_SERVER['URI'],
            method: 'POST',
            headers: REQUEST_HEADER,
            qs: packet_data
        }

        request(options, (err, res, body) => {
            if ( !err && res.statusCode == 200) {
                console.log(body);
            }
        });

        // 장비 -> 클라이언트
        io.emit('receive-packet', buffer_decode(data));
    })

    socket.on('close', function () {
        device_connector--;
        var socketPort = tcps.findIndex((item) => { return item.port == socket.remotePort});
        tcps['sockets'].splice(socketPort, 1);
        tcps['info'].splice(socketPort, 1);
        get_connect();
    })
});



io.on('send-packet', function () {
    console.log('recevive packet !');
});

function buffer_decode(data) {

    var string_data = JSON.stringify(data);
    var od = JSON.parse(string_data).data;
    hub_data.len = data.length;

    if ( od[0] == 170 && od[1] == 85 && od[2] == 2 ) {
        hub_data.name = 'omni';
        hub_data.hub_version = od[3];
        hub_data.hub_id = od[4];
        hub_data.hcu_id = od[5];
        hub_data.dcu_id = od[6];
        hub_data.electric = `${od[7]}T${od[8]}T${od[9]}T${od[10]}`;
        hub_data.water = `${od[11]}T${od[12]}T${od[13]}T${od[14]}`;
        hub_data.ext1 = `${od[15]}T${od[16]}T${od[17]}T${od[18]}`;
        hub_data.ext1 = `${od[19]}T${od[20]}T${od[21]}T${od[22]}`;
        hub_data.ext1 = `${od[23]}T${od[24]}T${od[25]}T${od[26]}`;
        hub_data.ext1 = `${od[27]}T${od[28]}T${od[29]}T${od[30]}`;
    }


    var re_string_data = JSON.stringify(hub_data);

    return re_string_data;
}

function buffer_encode(data) {
    //return conv(data, {in: 'utf8', out: 'hex'});
}

function get_connect() {
    io.emit('response-connect-count', {
        device: device_connector,
        client: client_connector,
        device_info: tcps['info'],
        client_info: clients
    });
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