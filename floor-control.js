module.exports = function FloorControl( floor, status ) {
    var f = '0x' + floor - 1;

    // 16진수로 12 칸
    var data = [];

    /**
     * Header1
     * @type {string}
     * @var 0xAA
     * @comment 이 값은 고정값임
     */
    data[0  ] = '0xAA';

    /**
     * Header2
     * @type {string}
     */
    data[1  ] = '0x55'; // header 2 : 0x55

    /**
     * Packet Type
     * @type {string}
     */
    data[2  ] = '0x80'; // Packet type : 0x80

    /**
     * Server Ver
     * @comment 임의 값 서버 버전
     * @type {string}
     */
    data[3  ] = '0x01';

    /**
     * Hub ID
     * @comment Hub ID 고정 값 0xe
     * @type {string}
     */
    data[4  ] = '0x0e'; // Server ID : 임의 값

    /**
     * Dev ID
     * @comment 각 층번호
     * @comment 예) 1층 0x00, 2층 0x01, 3층 0x02 ....
     * @type {string}
     */
    data[5  ] = f || '0x00';

    /**
     * Void
     * @comment 사용 안함 - 0x00
     * @type {string}
     */
    data[6  ] = '0x00';

    /**
     * Data Type
     * @comment 0x01: 출력, 0x02: 전기 0x03: 수도 0x04: 온수 0x05: 가스 0x06~0x08: 확장
     * @type {string}
     */
    data[7  ] = '0x01';

    /**
     * Data 0
     * @comment ON - 0x00000001 OFF - 0x00000000
     * @type {string}
     */
    data[8  ] = status ? '0x00000000' : '0x00000001';

    /**
     * Data 1
     * @comment 전기
     * @type {string}
     */
    data[9  ] = '0x00000000';

    /**
     * Data 2
     * @comment 수도
     * @type {string}
     */
    data[10 ] = '0x00000000';

    /**
     * Data 3
     * @comment
     * @type {string}
     */
    data[11 ] = '0x00000000';

    var buf = new Buffer(data);
    return buf;
}