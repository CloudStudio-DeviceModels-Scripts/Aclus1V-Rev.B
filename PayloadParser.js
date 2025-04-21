function parseUplink(device, payload) {
    // Asegurarse de que el payload se convierte correctamente a bytes
    var payloadb = payload.asBytes(); // Asumiendo que esto convierte correctamente a bytes
    
    env.log("Payloadb:", payloadb);
    // Asegurarse de que estás pasando el array de bytes a la función Decoder
    var decoded = Decoder(payloadb); // Asegúrate de que estás pasando el array de bytes
    env.log("Decoder:", decoded);
  
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

    if (decoded.some(variable => variable.variable === 'cumulative_flow')) {
        var sensor2a = device.endpoints.byAddress("2a");
        var cflowValue = decoded.find(variable => variable.variable === 'cumulative_flow').value;
        if (sensor2a != null)
            sensor2a.updateFlowSensorValueSummation(cflowValue*1000);
    };

  // Cumulative flow
    if (decoded.some(variable => variable.variable === 'cumulative_flow')) {
        var sensor3 = device.endpoints.byAddress("3");
        var cflowValue = decoded.find(variable => variable.variable === 'cumulative_flow').value;
        if (sensor3 != null)
            sensor3.updateVolumeSensorStatus(cflowValue*1000);
    };

  // Reverse cumulative flow
    if (decoded.some(variable => variable.variable === 'reverse_cumulative_flow')) {
        var sensor4 = device.endpoints.byAddress("4");
        var rflowValue = decoded.find(variable => variable.variable === 'reverse_cumulative_flow').value;
        if (sensor4 != null)
            sensor4.updateVolumeSensorStatus(rflowValue*1000);
    };
  // Daily cumulative flow
    if (decoded.some(variable => variable.variable === 'daily_cumulative_amount')) {
        var sensor5 = device.endpoints.byAddress("5");
        var dflowValue = decoded.find(variable => variable.variable === 'daily_cumulative_amount').value;
        if (sensor5 != null)
            sensor5.updateVolumeSensorStatus(dflowValue*1000);
    };
  // Apertura
    if (decoded.some(variable => variable.variable === 'apertura')) {
        var sensor6 = device.endpoints.byAddress("6");
        var apertura = decoded.find(variable => variable.variable === 'apertura').value;
        if (sensor6 != null)
            sensor6.updateClosureControllerStatus(false,apertura);
    };

  // Bateria_voltage
    if (decoded.some(variable => variable.variable === 'battery')) {
        var sensor7 = device.endpoints.byAddress("7");
        var battery = decoded.find(variable => variable.variable === 'battery').value;
        if (sensor7 != null)
            sensor7.updateIASSensorStatus(battery);
    };

  // Bateria_alarma
    if (decoded.some(variable => variable.variable === 'battery_1')) {
        var sensor8 = device.endpoints.byAddress("8");
        var battery_1 = decoded.find(variable => variable.variable === 'battery_1').value;
        if (sensor8 != null)
            sensor8.updateIASSensorStatus(battery_1);
    };

  // Empty
    if (decoded.some(variable => variable.variable === 'empty')) {
        var sensor9 = device.endpoints.byAddress("9");
        var empty = decoded.find(variable => variable.variable === 'empty').value;
        if (sensor9 != null)
            sensor9.updateIASSensorStatus(empty);
    };

  // Reverse Flow
    if (decoded.some(variable => variable.variable === 'reverse_flow')) {
        var sensor10 = device.endpoints.byAddress("10");
        var reverse_flow = decoded.find(variable => variable.variable === 'reverse_flow').value;
        if (sensor10 != null)
            sensor10.updateIASSensorStatus(reverse_flow);
    };

  // Over Range
    if (decoded.some(variable => variable.variable === 'over_range')) {
        var sensor11 = device.endpoints.byAddress("11");
        var over_range = decoded.find(variable => variable.variable === 'over_range').value;
        if (sensor11 != null)
            sensor11.updateIASSensorStatus(over_range);
    };

  // Water Temp
    if (decoded.some(variable => variable.variable === 'water_temp')) {
        var sensor12 = device.endpoints.byAddress("12");
        var water_temp = decoded.find(variable => variable.variable === 'water_temp').value;
        if (sensor12 != null)
            sensor12.updateIASSensorStatus(water_temp);
    };

  // ee alarm
    if (decoded.some(variable => variable.variable === 'ee_alarm')) {
        var sensor13 = device.endpoints.byAddress("13");
        var ee_alarm = decoded.find(variable => variable.variable === 'ee_alarm').value;
        if (sensor13 != null)
            sensor13.updateIASSensorStatus(ee_alarm);
    };

 // meter_addr
    if (decoded.some(variable => variable.variable === 'meter_addr')) {
        var sensor14 = device.endpoints.byAddress("14");
        var meter_addr = decoded.find(variable => variable.variable === 'meter_addr').value;
        if (sensor14 != null)
            sensor14.updateTextContainerStatus(meter_addr);
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

    function swap32(arr) {
        // Intercambio manual de dos bytes para ajustar el orden de los bytes
        return new Uint8Array([arr[3], arr[2], arr[1], arr[0]]);
    }

    function readInt32LE(arr, offset) {
        // Lectura manual de un entero de 32 bits en formato Little Endian
        return (arr[offset] | arr[offset + 1] << 8 | arr[offset + 2] << 16 | arr[offset + 3] << 24) >>> 0;
    }

    function readInt16BE(arr, offset) {
        // Lectura de un entero de 16 bits en formato Big Endian
        return (arr[offset] << 8) | arr[offset + 1];
    }

    function parseHex(bytes) {
        // Conversión de un array de bytes a una cadena hexadecimal
        return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    }

    function bytesToInt(byte1, byte2) {
    // Ensure the bytes are within the range 0-255
    if (byte1 < 0 || byte1 > 255 || byte2 < 0 || byte2 > 255) {
        throw new Error("Bytes must be in the range 0-255");
    }

    // Combine the two bytes using bitwise operations
    return (byte1 << 8) | byte2;
    }

    function bytesToBinaryString(bytes) {
        // Ensure the bytes array is long enough
        if (bytes.length < 45) {
            throw new Error("Bytes array must have at least 46 elements");
        }

        // Extract the relevant bytes
        const byte1 = bytes[44];
        const byte2 = bytes[45];

        // Combine the two bytes using bitwise operations
        const combined = (byte1 << 8) | byte2;

        // Convert to binary string and pad to 16 bits
        return combined.toString(2).padStart(16, '0');
    }

    function intToBinaryString(number, padding = 0) {
    // Check if the input is a valid integer
    if (!Number.isInteger(number)) {
        throw new Error("Input must be an integer");
    }

    // Convert the integer to a binary string
    let binaryString = number.toString(2);

    // Pad the binary string to the desired length
    if (padding > 0) {
        binaryString = binaryString.padStart(padding, '0');
    }

    return binaryString;   
    }


    // Decodificación de los datos del array de bytes usando la nueva interpretación

    var length = bytes.length;
    env.log("Length:", length)
    var protocol = length.toString(16);
    env.log("Protocol:", protocol)

    let data = [];  // Declare data outside of the switch statement

    switch (protocol) {
        case '31':
            const start_code = byteToHexDecimal(bytes[0]);
            const meter_type = byteToHexDecimal(bytes[1]);
            const meter_addr = parseHex(bytes.slice(8, 9)) + parseHex(swap16(bytes.slice(6, 8))) + parseHex(swap32(bytes.slice(2, 6)));
            const control_code = parseHex(bytes.slice(9, 10));
            const data_length = bytes[10];
            const data_id = parseHex(bytes.slice(11, 13));
            const serial = parseHex(bytes.slice(13, 14));
            const cf_unit = parseHex(bytes.slice(14, 15));
            const cumulative_flow = readInt32LE(bytes, 15).toString('16') / 100;
            const cf_unit_set_day = parseHex(bytes.slice(19, 20));
            const daily_cumulative_amount = readInt32LE(bytes, 20).toString('16') / 100;
            const reverse_cf_unit = parseHex(bytes.slice(24, 25));
            const reverse_cumulative_flow = parseInt(readInt32LE(bytes, 25)).toString('16') / 100;
            const flow_rate_unit = parseHex(bytes.slice(29, 30));
            const flow_rate = parseInt(readInt32LE(bytes, 30)).toString('16') / 100;
            const temperature = byteToHexDecimal(bytes[35]) + byteToHexDecimal(bytes[34]) / 100;
            const dev_date = parseHex(bytes.slice(40, 41)) + '/' + parseHex(bytes.slice(41, 42)) + '/' + parseHex(swap16(bytes.slice(42, 44))) + " " + parseHex(bytes.slice(39, 40)) + ':' + parseHex(bytes.slice(38, 39)) + ':' + parseHex(bytes.slice(37, 38));
            const time = parseHex(bytes.slice(39, 40)) + ':' + parseHex(bytes.slice(38, 39)) + ':' + parseHex(bytes.slice(37, 38));
            const alarm = intToBinaryString(bytesToInt(bytes[44],bytes[45])).padStart(16, '0');
            env.log ("Alarm:", alarm)
            const apertura = alarm.charAt(6)+alarm.charAt(7) === '00' ? '100': alarm.charAt(6)+alarm.charAt(7) === '01' ? '0': alarm.charAt(6)+alarm.charAt(7) === '10'? '90': alarm.charAt(6)+alarm.charAt(7) === '11'? 'true': 'false';
            const bateria = alarm.charAt(5) === '0' ? '1' : '2';
            const bateria_1 = alarm.charAt(15) === '0' ? '1' : '2';
            const empty = alarm.charAt(14) === '0' ? '1' : '2';
            const reverse_flow = alarm.charAt(13) === '0' ? '1' : '2';
            const over_range = alarm.charAt(12) === '0' ? '1' : '2';
            const water_temp = alarm.charAt(11) === '0' ? '1' : '2';
            const ee_alarm = alarm.charAt(10) === '0' ? '1' : '2';

            data = [
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
                { variable: 'apertura', value: apertura },
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
            break;

        case '14':
            const apertura_14 = parseHex(bytes.slice(18, 19)) === '96' ? '0' : parseHex(bytes.slice(18, 19)) === '97' ? '100' : '57';
            env.log ("Apertura_14:", apertura_14)
            data = [
                { variable: 'apertura', value: apertura_14 },
            ];
            break;

        case '12':
            const apertura_12 = '90';
            data = [
                { variable: 'apertura', value: apertura_12 },
            ];
            break;

        // Añadir otros casos si es necesario...
    }

    return data;
}



function buildDownlink(device, endpoint, command, payload) {
    // This function allows you to convert a command from the platform 
    // into a payload to be sent to the device.
    // Learn more at https://wiki.cloud.studio/page/200

    // The parameters in this function are:
    // - device: object representing the device to which the command will
    //   be sent. 
    // - endpoint: endpoint object representing the endpoint to which the 
    //   command will be sent. May be null if the command is to be sent to 
    //   the device, and not to an individual endpoint within the device.
    // - command: object containing the command that needs to be sent. More
    //   information at https://wiki.cloud.studio/page/1195.

    // This example is written assuming a device that contains a single endpoint, 
    // of type appliance, that can be turned on, off, and toggled. 
    // It is assumed that a single byte must be sent in the payload, 
    // which indicates the type of operation.
    
    payload.port = 2; 	 	 // This device receives commands on LoRaWAN port 2 
    payload.buildResult = downlinkBuildResult.ok; 

    switch (command.type) { 
        case commandType.closure: 
            switch (command.closure.type) { 
                    case closureCommandType.close: 
                            payload.setAsBytes(hexStringToByteArray("6810AAAAAAAAAAAAAA0404A01700997616")); 	 	 // Command is "turn on" 
                            break; 
                    case closureCommandType.open: 
                            payload.setAsBytes(hexStringToByteArray("6810AAAAAAAAAAAAAA0404A01700553216")); 	 	 // Command is "turn off" 
                            break; 
                    case closureCommandType.position:
                            if (command.closure.position == 0) {
                                payload.setAsBytes(hexStringToByteArray("6810AAAAAAAAAAAAAA0404A01700997616")); 	 	 // Command is "turn on" 
                            } else if (command.closure.position == 100) {
                                payload.setAsBytes(hexStringToByteArray("6810AAAAAAAAAAAAAA0404A01700553216")); 	 	 // Command is "turn off" 
                            } else {
                                payload.setAsBytes(hexStringToByteArray("6810AAAAAAAAAAAAAA3204030000015816")); 	 	 // Command is "90%" 
                            }
                            break; 
                    default: 
                        payload.buildResult = downlinkBuildResult.unsupported; 
                        break; 
                } 
                break; 
        default: 
            payload.buildResult = downlinkBuildResult.unsupported; 
            break; 
    }

}

function hexStringToByteArray(hexString) {
    if (hexString.length % 2 !== 0) {
        throw new Error("The length of the hexadecimal string must be even.");
    }

    const byteArray = [];
    for (let i = 0; i < hexString.length; i += 2) {
        const byte = hexString.substr(i, 2);
        byteArray.push(parseInt(byte, 16));
    }

    return byteArray;
}