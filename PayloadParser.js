function parseUplink(device, payload) {
    // Asegurarse de que el payload se convierte correctamente a bytes
    var payloadb = payload.asBytes(); // Asumiendo que esto convierte correctamente a bytes
    
    env.log("Payloadb:", payloadb);
    // Asegurarse de que estás pasando el array de bytes a la función Decoder
    var decoded = Decoder(payloadb); // Asegúrate de que estás pasando el array de bytes
    env.log(decoded);
  
    // Temperature
    if (decoded.some(variable => variable.variable === 'temperature')) {
        var sensor1 = device.endpoints.byAddress("1");
        var temperatureValue = decoded.find(variable => variable.variable === 'temperature').value;
        if (sensor1 != null)
            sensor1.updateTemperatureSensorStatus(temperatureValue);
    };

      // Flow Rate
    if (decoded.some(variable => variable.variable === 'flow_rate')) {
        var sensor2 = device.endpoints.byAddress("2");
        var flowrateValue = decoded.find(variable => variable.variable === 'flow_rate').value;
        if (sensor2 != null)
            sensor2.updateGenericSensorStatus(flowrateValue);
    };
  // Cumulative flow
    if (decoded.some(variable => variable.variable === 'cumulative_flow')) {
        var sensor3 = device.endpoints.byAddress("3");
        var cflowValue = decoded.find(variable => variable.variable === 'cumulative_flow').value;
        if (sensor3 != null)
            sensor3.updateGenericSensorStatus(cflowValue);
    };
  // Reverse cumulative flow
    if (decoded.some(variable => variable.variable === 'reverse_cumulative_flow')) {
        var sensor4 = device.endpoints.byAddress("4");
        var rflowValue = decoded.find(variable => variable.variable === 'reverse_cumulative_flow').value;
        if (sensor4 != null)
            sensor4.updateGenericSensorStatus(rflowValue);
    };
  // Daily cumulative flow
    if (decoded.some(variable => variable.variable === 'daily_cumulative_amount')) {
        var sensor5 = device.endpoints.byAddress("5");
        var dflowValue = decoded.find(variable => variable.variable === 'daily_cumulative_amount').value;
        if (sensor5 != null)
            sensor5.updateGenericSensorStatus(dflowValue);
    };
  // Apertura
    if (decoded.some(variable => variable.variable === 'apertura')) {
        var sensor6 = device.endpoints.byAddress("6");
        var apertura = decoded.find(variable => variable.variable === 'apertura').value;
        if (sensor6 != null)
            sensor6.updateGenericSensorStatus(apertura);
    };

}

function Decoder(bytes) {
    // Convertir el byte individual a una cadena hexadecimal y luego a un número decimal
    function byteToHexDecimal(byte) {
        return parseInt(byte.toString(16), 10);
    }

    function swap16(arr) {
        // Intercambio manual de dos bytes para ajustar el orden de los bytes
        return new Uint8Array([arr[1], arr[0]]);
    }

    function readInt32LE(arr, offset) {
        // Lectura manual de un entero de 32 bits en formato Little Endian
        return (arr[offset] | arr[offset + 1] << 8 | arr[offset + 2] << 16 | arr[offset + 3] << 24) >>> 0;
    }

    function parseHex(bytes) {
        // Conversión de un array de bytes a una cadena hexadecimal
        return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    }

    // Decodificación de los datos del array de bytes usando la nueva interpretación
    const start_code = byteToHexDecimal(bytes[0]);
    const meter_type = byteToHexDecimal(bytes[1]);
    const meter_addr = parseHex(bytes.slice(8, 9)) + parseHex(swap16(bytes.slice(6, 8))) + parseHex(bytes.slice(2, 6));
    const control_code = parseHex(bytes.slice(9, 10));
    const data_length = bytes[10];
    const data_id = parseHex(bytes.slice(11, 13));
    const serial = parseHex(bytes.slice(13, 14));
    const cf_unit = parseHex(bytes.slice(14, 15));
    const cumulative_flow = readInt32LE(bytes, 15) / 100;
    const cf_unit_set_day = parseHex(bytes.slice(19, 20));
    const daily_cumulative_amount = readInt32LE(bytes, 20) / 100;
    const reverse_cf_unit = parseHex(bytes.slice(24, 25));
    const reverse_cumulative_flow = parseInt(readInt32LE(bytes, 25)) / 100;
    const flow_rate_unit = parseHex(bytes.slice(29, 30));
    const flow_rate = parseInt(readInt32LE(bytes, 30)) / 10000;
    const temperature = byteToHexDecimal(bytes[35]) + byteToHexDecimal(bytes[34]) / 100;
    const dev_date = parseHex(bytes.slice(40, 41)) + '/' + parseHex(bytes.slice(41, 42)) + '/' + parseHex(swap16(bytes.slice(42, 44))) + " " + parseHex(bytes.slice(39, 40)) + ':' + parseHex(bytes.slice(38, 39)) + ':' + parseHex(bytes.slice(37, 38));
    const time = parseHex(bytes.slice(39, 40)) + ':' + parseHex(bytes.slice(38, 39)) + ':' + parseHex(bytes.slice(37, 38));
    const alarm = parseInt(bytes.slice(45, 46)).toString(2).padStart(16, '0');
    const apertura = alarm.charAt(6)+alarm.charAt(7) === '00' ? 'open': alarm.charAt(6)+alarm.charAt(7) === '01' ? 'closed': alarm.charAt(6)+alarm.charAt(7) === '11'? 'anormal': 'otro';
    const bateria = alarm.charAt(5) === '0' ? 'normal' : 'low battery';
    const bateria_1 = alarm.charAt(15) === '0' ? 'normal' : 'alarma';
    const empty = alarm.charAt(14) === '0' ? 'normal' : 'alarma';
    const reverse_flow = alarm.charAt(13) === '0' ? 'normal' : 'alarma';
    const over_range = alarm.charAt(12) === '0' ? 'normal' : 'alarma';
    const water_temp = alarm.charAt(11) === '0' ? 'normal' : 'alarma';
    const ee_alarm = alarm.charAt(10) === '0' ? 'normal' : 'alarma';
    /*const reserved = bytes.slice(46, 47).toString('hex');
    const check_sume = bytes.slice(47, 48).toString('hex');
    const end_mark = bytes.slice(48, 49).toString('hex');*/

    // Después de decodificar todos los campos, devolverlos en forma de array de objetos
    const data = [
        { variable: 'start_code', value: start_code },
        { variable: 'meter_type', value: meter_type },
        { variable: 'meter_addr', value: meter_addr },
        { variable: 'control_code', value: control_code },
        { variable: 'data_length', value: data_length },
        { variable: 'data_id', value: data_id },
        { variable: 'serial', value: serial },
        { variable: 'cf_unit', value: cf_unit },
        { variable: 'cumulative_flow', value: cumulative_flow },
        { variable: 'cf_unit_set_day', value: cf_unit_set_day },
        { variable: 'daily_cumulative_amount', value: daily_cumulative_amount },
        { variable: 'reverse_cf_unit', value: reverse_cf_unit },
        { variable: 'reverse_cumulative_flow', value: reverse_cumulative_flow },
        { variable: 'flow_rate_unit', value: flow_rate_unit },
        { variable: 'flow_rate', value: flow_rate },
        { variable: 'temperature', value: temperature },
        { variable: 'dev_date', value: dev_date },
        { variable: 'dev_time', value: time },
        { variable: 'status', value: alarm },
        { variable: 'valv', value: apertura },
        { variable: 'battery', value: bateria },
        { variable: 'battery_1', value: bateria_1 },
        { variable: 'empty', value: empty },
        { variable: 'reverse_flow', value: reverse_flow },
        { variable: 'over_range', value: over_range },
        { variable: 'water_temp', value: water_temp },
        { variable: 'ee_alarm', value: ee_alarm },
        /*{ variable: 'reserved', value: reserved },
        { variable: 'check_sume', value: check_sume },
        { variable: 'end_mark', value: end_mark },*/
        // Añadir otros campos decodificados aquí si es necesario...
    ];

    return data;
}
