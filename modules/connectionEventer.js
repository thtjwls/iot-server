/**
 * 디바이스 커넥션에 대한 이벤트 모듈.
 * 인자로 Socket Io Connection 객체를 넘겨줘야 한다.
 * @param io
 * @returns object
 */
module.exports = function (io) {

    const request = require('request');

    let sockets = [];

    if ( io === undefined ) {
        console.error('Error !!! Socket IO Connection 객체를 인자로 넘겨줘야 함.');
        return process.exit();
    }

    return {
        /**
         * 소켓 연결 객체를 가져옴
         * @param socketConnection
         */
        getConnection: function () {
            io.emit('getTcpConnections', sockets.length);
            return sockets;
        },

        /**
         * 소켓 연결을 해제시킴
         */
        deleteConnection: function (socket) {

            let socketPort = sockets.findIndex( item => {
                return item.port == socket.remotePort;
            });

            sockets.splice(socketPort, 1);
            return this.getConnection();
        },

        /**
         * 소켓 연결을 추가함
         */
        addConnection: function (socket) {
            sockets.push(socket);
            return this.getConnection();
        },

        /**
         * 데이터 발생 이벤트를 보냄
         */
        onData: function () {
            io.emit('hubToServerOnData');
        },

        /**
         * API 서버를 호출 후 데이터를 보냄
         */
        postData: function (API_URL, data) {
            try {

                let options = {
                    url: API_URL,
                    method: 'POST',
                    headers: {
                        'Content-Type'  : 'application/json',
                        'User-Agent'    : 'Super Agent/0.0.1'
                    },
                    qs: data
                }

                request(options, (err, res, body) => {
                    if ( !err && res.statusCode == 20) {
                        return body;
                    } else {
                        return false;
                    }
                });

            } catch (e) {
                console.log(e);
            } finally {
                this.onData();
            }
        }
    }
}