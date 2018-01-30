module.exports = function () {

    return {

        /**
         * 옴니 데이터 전용 버퍼 디코더
         * @param data
         * @returns {string}
         */

        buffer_decode: function (data) {
            let string_data = JSON.stringify(data);
            let od = JSON.parse(string_data).data;
            let hub_data = {};

            hub_data.len = data.length;

            if ( od[0] == 170 && od[1] == 85 && od[2] == 2 ) {
                hub_data.name = 'omni';
                hub_data.hub_version = od[3];
                hub_data.hub_id = od[4];
                hub_data.dcu_id = od[5];
                hub_data.hcu_id = od[6];

                var ele_packet = '0x' + od[7].toString(16) + od[8].toString(16) + od[9].toString(16) + od[10].toString(16);
                hub_data.electricX16 = ele_packet;
                hub_data.electric = parseInt(ele_packet, 16) / 1000;
                hub_data.electric_normal1 = od[7].toString(16);
                hub_data.electric_normal2 = od[8].toString(16);
                hub_data.electric_normal3 = od[9].toString(16);
                hub_data.electric_normal4 = od[8].toString(16);
                var wat_packet = '0x' + od[11].toString(16) + od[12].toString(16) + od[13].toString(16) + od[14].toString(16);
                hub_data.water = parseInt(wat_packet, 16) / 1000;
                hub_data.waterX16 = wat_packet;
                hub_data.water_normal1 = od[11].toString(16);
                hub_data.water_normal2 = od[12].toString(16);
                hub_data.water_normal3 = od[13].toString(16);
                hub_data.water_normal4 = od[14].toString(16);
                hub_data.ext1 = `${od[15]}:${od[16]}:${od[17]}:${od[18]}`;
                hub_data.ext1 = `${od[19]}:${od[20]}:${od[21]}:${od[22]}`;
                hub_data.ext1 = `${od[23]}:${od[24]}:${od[25]}:${od[26]}`;
                hub_data.ext1 = `${od[27]}:${od[28]}:${od[29]}:${od[30]}`;
            }


            var re_string_data = JSON.stringify(hub_data);

            return re_string_data;
        }
    }
}