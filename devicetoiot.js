//------------------------------------------------------------------------------
// Markus van Kempen - mvk@ca.ibm.com
//------------------------------------------------------------------------------
var mqtt = require('mqtt');
var url = require('url');
var macUtil = require('getmac');
var properties = require('properties');
var connected = false;

/**
 *
 *  Demonstration for the unofficial_nest library with IOT
 *
 */

"option strict";
var util = require('util'),
    nest = require('./index.js'); 

properties.parse('./config.properties', {path: true}, function(err, cfg) {
  if (err) {
    console.error('A file named config.properties containing the device registration from the IBM IoT Cloud is missing.');
    console.error('The file must contain the following properties: org, type, id, auth-token. nestusername and nestpassword');
    throw e;
  }
  macUtil.getMac(function(err, macAddress) {
    if (err) throw err;
    var deviceId = macAddress.replace(/:/gi, '');
    console.log('Device MAC Address: ' + deviceId);

//    if(cfg.id != deviceId) {
//    	console.warn('The device MAC address does not match the ID in the configuration file.');
//    }
//cfg.org = 'quickstart'; // for quickstart comment out if you have ur own org
    var clientId = ['d', cfg.org, cfg.type, cfg.id].join(':');

var username = cfg.nestusername;
var password = cfg.nestpassword

console.log('Nest Username = ' + username);
console.log('clientId = ' + clientId);


//    client = mqtt.createSecureClient('8883', cfg.org + '.messaging.internetofthings.ibmcloud.com', 
    client = mqtt.createClient('1883',   cfg.org + '.messaging.internetofthings.ibmcloud.com', 
      {
        "clientId" : clientId,
//		 "clientId" : 'd:quickstart:paho-client:8c705ae36b0c',
        "keepalive" : 30,
//        "username" : "",// for quickstarts
//        "password" : "" // for quickstarts
        "username" : "use-token-auth",
        "password" : cfg['auth-token']
      });

    client.on('connect', function() {
	  console.log('MQTT client connected to IBM IoT Cloud.');
	  console.log("We are DeviceID  : "+cfg.id);


// does not work
//iot-2/type/mvk-laptoplan/id/00-21-CC-C8-6F-1B/cmd/MVK/fmt/json
//client.subscribe('iot-2/type/+/id/00-21-CC-C8-6F-1B/+/MVK/fmt/json');
//console.log("Subscribe : "+'iot-2/type/+/id/00-21-CC-C8-6F-1B/+/MVK/fmt/json');

// Note - as a device you can only subscribe to CMD
//publish to : iot-2/type/mvk-laptoplan/id/00-21-CC-C8-6F-1B/cmd/MVK/fmt/json
/* example message
    {
        "d": {
             "myName": "Paho client",
             "TargetTemp": 60
        }
    }
*/

// received events: iot-2/type/mvk-laptoplan/id/00-21-CC-C8-6F-1B/evt/+/fmt/json

client.subscribe('iot-2/cmd/+/fmt/json');
console.log("Subscribe : "+'iot-2/cmd/+/fmt/json'); // Note: does not work for quickstart
    });//client.on
	
 
	client.on('message', function(topic, message) {
    console.log(">>>>> Topic: " +topic + "  Msg: "+message);

	myData = JSON.parse(message);
	
	if (myData.d.TargetTemp != null)
	{
		myNewTargetTemp = myData.d.TargetTemp;
		console.log("Setting tempature " + myData.d.TargetTemp);

	}else{
		console.log("Error ins message item TargetTemp not found in topic"+message);
				console.log("Set to 70 default");
		myNewTargetTemp = 70;
	}

	console.log("Setting tempature to "+myNewTargetTemp);

        nest.fetchStatus(function (nestdata) {
            for (var deviceId in nestdata.device) {
                if (nestdata.device.hasOwnProperty(deviceId)) {
                    var device = nestdata.shared[deviceId];
				if (device.name == 'Bedroom')
				{				
                    console.log(util.format(">>> Setting temparatur to  %s for %s [%s]", myNewTargetTemp,device.name, deviceId));

					nest.setTemperature(deviceId, myNewTargetTemp);
				}else{
                    console.log(util.format(">>>Mutliple Device skip  %s [%s]", device.name, deviceId));
				}//device.name
				}//
            }//for

	});//nest.fetchStatus(
//	nest.setTemperature(80);
	});///client.on('message', f

    client.on('error', function(err) {
	  console.log('client error' + err);
	  process.exit(1);
    });
    client.on('close', function(msg) {
	  console.log('client closed: '+msg);
	  process.exit(1);
    });

/*
var data = {
                   "d": {
                     "myName": "Sensor Infos",
                     "pressure" : 0.1,
                     "temp" : 10
                    }
                  };
  				console.log("Publish Message : "+JSON.stringify(data));
                client.publish('iot-2/evt/MVK/fmt/json', JSON.stringify(data), function() {
                });


		  	  	data = {
                   "d": {
                     "myName": "Markus Infos",
                     "pressure" : 0.1,
                     "temp" : 10
                    }
                  };
				console.log("Publish Message : "+JSON.stringify(data));
                client.publish('iot-2/evt/MVK/fmt/json', JSON.stringify(data), function() {
                });
*/

// nest 
if (username && password) {
    username = trimQuotes(username);
    password = trimQuotes(password);
    nest.login(username, password, function (err, nestdata) {
        if (err) {
            console.log(err.message);
            process.exit(1);
            return;
        }
        console.log('Logged into Nest.');
        nest.fetchStatus(function (nestdata) {
            for (var deviceId in nestdata.device) {
                if (nestdata.device.hasOwnProperty(deviceId)) {
                    var device = nestdata.shared[deviceId];
				if (device.name == 'Bedroom')
				{
				
                    console.log(util.format("%s [%s], Current temperature = %d C target=%d",
                        device.name, deviceId,
                        device.current_temperature,
                        device.target_temperature));

		  	  	var myJsonData = {
                   "d": {
                     "myName": "Nest Data",
                     "deviceName" : device.name,
                     "deviceId"    : deviceId,
                     "currentTemp" : device.current_temperature,
                     "targetTemp"  :  device.target_temperature

                    }
                  };

				console.log("Set Temperature to 72 : ");
				nest.setTemperature(deviceId, 68);

				console.log("Publish Nest Message : "+JSON.stringify(myJsonData));
				//subscribe to iot-2/type/mvk-laptoplan/id/00-21-CC-C8-6F-1B/evt/+/fmt/json
             //   client.publish('iot-2/evt/MVK/fmt/json', JSON.stringify(myJsonData), function() {
			   client.publish('iot-2/evt/status/fmt/json', JSON.stringify(myJsonData), function() {
                });
				}else{
                    console.log(util.format(">>>Mutliple Device skip  %s [%s]", device.name, deviceId));
				}
				}
            }
            var ids = nest.getDeviceIds();
            //nest.setTemperature(ids[0], 70);
           //nest.setTemperature(70);
            //nest.setFanModeAuto();
			subscribe();
            //nest.setAway();
            //nest.setHome();
            //nest.setTargetTemperatureType(ids[0], 'heat');
        });
    });
}else{
				console.log("No NEST userid in config file ");
}



  });
});



function trimQuotes(s) {
    if (!s || s.length === 0) {
        return '';
    }
    var c = s.charAt(0);
    var start = (c === '\'' || c === '"') ? 1 : 0;
    var end = s.length;
    c = s.charAt(end - 1);
    end -= (c === '\'' || c === '"') ? 1 : 0;
    return s.substring(start, end);
}

function merge(o1, o2) {
    o1 = o1 || {};
    if (!o2) {
        return o1;
    }
    for (var p in o2) {
        o1[p] = o2[p];
    }
    return o1;
}


function subscribe() {
    nest.subscribe(subscribeDone, ['shared', 'energy_latest']);
}

function subscribeDone(deviceId, subdata, type) {
    // data if set, is also stored here: nest.lastStatus.shared[thermostatID]
    if (deviceId) {
        nest.fetchStatus(function (data) {
            for (var deviceId in data.device) {
                if (data.device.hasOwnProperty(deviceId)) {
                    var device = data.shared[deviceId];
				if (device.name == 'Bedroom')
				{
				
                    console.log(util.format("%s [%s], Current temperature = %d C target=%d",
                        device.name, deviceId,
                        device.current_temperature,
                        device.target_temperature));

		  	  	var myJsonData = {
                   "d": {
                     "myName": "Nest Data",
                     "deviceName" : device.name,
                     "deviceId" : deviceId,
                     "currentTemp" : device.current_temperature,
                     "targetTemp" :  device.target_temperature
				   }				
             };
				console.log("Publish Nest Message : "+JSON.stringify(myJsonData));
				//subscribe to iot-2/type/mvk-laptoplan/id/00-21-CC-C8-6F-1B/evt/+/fmt/json
             //   client.publish('iot-2/evt/MVK/fmt/json', JSON.stringify(myJsonData), function() {
			   client.publish('iot-2/evt/status/fmt/json', JSON.stringify(myJsonData), function() {
                });
				}else{
                    console.log(util.format(">>>Mutliple Device skip  %s [%s]", device.name, deviceId));
				}
				}
            }
	
        });

        console.log('Device: ' + deviceId + " type: " + type);
        //console.log('energy_latest\n');
    //   console.log(JSON.stringify(subdata));
    } else {
        console.log('No data');

    }
    setTimeout(subscribe, 2000);
}
