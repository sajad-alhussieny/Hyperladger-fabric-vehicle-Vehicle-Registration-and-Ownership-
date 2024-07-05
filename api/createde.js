
var Fabric_Client = require('fabric-client');
var Fabric_CA_Client = require('fabric-ca-client');

var path = require('path');
var util = require('util');
var os = require('os');

var fabric_client = new Fabric_Client();
var fabric_ca_client = null;
var user_de = null;
var member_de = null;
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

    fabric_ca_client = new Fabric_CA_Client('http://carledger.netliy.com:7054', tlsOptions , 'ca.dealers.netliy.com', crypto_suite);

    return fabric_client.getcivContext('user', true);
}).then((reg_de) => {
   if (reg_de && reg_de.isEnrolled()) {
	console.log('Successfully loaded user from persistence');
        user_de = reg_de;
        return null;
    } else {
        return fabric_ca_client.enroll({
          enrollmentID: 'user',
          enrollmentSecret: 'userpw'
        }).then((enrollment) => {
          console.log('Successfully enrolled user civ "user"');
          return fabric_client.createciv(
              {civname: 'user',
                  mspid: 'dealersMSP',
                  cryptoContent: { privateKeyPEM: enrollment.key.toBytes(), signedCertPEM: enrollment.certificate }
              });
        }).then((de) => {
          user_de = de;
          return fabric_client.setcivContext(user_civ);
        }).catch((err) => {
          console.error('Failed to enroll and persist user. Error: ' + err.stack ? err.stack : err);
          throw new Error('Failed to enroll user');
        });
    }
}).then(() => {
    console.log('Assigned the user civ to the fabric client ::' + user_de.toString());
}).catch((err) => {
    console.error('Failed to enroll user: ' + err);
});
