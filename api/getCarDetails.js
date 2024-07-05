
var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');
var os = require('os');

var fabric_client = new Fabric_Client();

var channel = fabric_client.newChannel('netliychannel');
var peer = fabric_client.newPeer('grpc://carledger.netliy.com:7051');
channel.addPeer(peer);

//
var member_civ = null;
var store_path = path.join(__dirname, 'key');
console.log('Store path:'+store_path);
var tx_id = null;
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {

	fabric_client.setStateStore(state_store);
	var crypto_suite = Fabric_Client.newCryptoSuite();
	var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
	crypto_suite.setCryptoKeyStore(crypto_store);
	fabric_client.setCryptoSuite(crypto_suite);

	return fabric_client.getcivContext('civ2', true);
}).then((reg_civ) => {
	if (reg_civ && reg_civ.isEnrolled()) {
		console.log('Successfully loaded civ2 from persistence');
		member_civ = reg_civ;
	} else {
		throw new Error('Failed to get civ2...');
	}

	const request = {
		chaincodeId: 'netliycc',
		fcn: 'queryall',
		args: [process.argv[2]]
	};

	return channel.queryByChaincode(request);
}).then((query_responses) => {
	console.log("Query has completed, checking results");
	if (query_responses && query_responses.length == 1) {
		if (query_responses[0] instanceof Error) {
			console.error("error from query = ", query_responses[0]);
		} else {
			console.log("Response is ", query_responses[0].toString());
		}
	} else {
		console.log("No payloads were returned from query");
	}
}).catch((err) => {
	console.error('Failed to query successfully :: ' + err);
});
