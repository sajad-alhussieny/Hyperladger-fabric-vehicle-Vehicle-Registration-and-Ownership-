var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');

var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var user_civ = null;
var member_civ = null;
var store_path = path.join(__dirname, 'key');
console.log(' Store path:'+store_path);
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {

    fabric_client.setStateStore(state_store);
    var crypto_suite = Fabric_Client.newCryptoSuite();

    var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
    crypto_suite.setCryptoKeyStore(crypto_store);
    fabric_client.setCryptoSuite(crypto_suite);
    var	tlsOptions = {
    	trustedRoots: [],
    	verify: false
    };

    fabric_ca_client = new Fabric_CA_Client('http://carledger.netliy.com:7054', null , '', crypto_suite);
    return fabric_client.getcivContext('user', true);
}).then((reg_civ) => {
    if (reg_civ && reg_civ.isEnrolled()) {
        console.log('Successfully loaded user from persistence');
        user_civ = reg_civ;
    } else {
        throw new Error('Failed to get user');
    }
    return fabric_ca_client.register({enrollmentID: 'civ2', affiliation: 'org1.department1',role: 'client'}, user_civ);
}).then((secret) => {
    console.log('Successfully registered civ2 - secret:'+ secret);

    return fabric_ca_client.enroll({enrollmentID: 'civ2', enrollmentSecret: secret});
}).then((enrollment) => {
  console.log('Successfully enrolled member civ "civ2" ');
  return fabric_client.createciv(
     {civname: 'civ2',
     mspid: 'dealersMSP',
     cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
     });
}).then((civ) => {
     member_civ = civ;

     return fabric_client.setcivContext(member_civ);
}).then(()=>{
     console.log('civ1 was successfully registered and enrolled and is ready to interact with the fabric network');

}).catch((err) => {
    console.error('Failed to register: ' + err);
	if(err.toString().indexOf('Authorization') > -1) {
		console.error('Authorization failures may be caused by having user credentials from a previous CA instance.\n' +
		'Try again after deleting the contents of the store directory '+store_path);
	}
});
