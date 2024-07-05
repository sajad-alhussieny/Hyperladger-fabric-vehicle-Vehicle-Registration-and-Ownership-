'use strict';

module.exports.info = 'opening accounts';
const { v1: uuidv4 } = require('uuid')


module.exports.run = async (testConfig) => {
    const bcClient = testConfig.bcClient;
    const helper = require('./helper')(bcClient);

    const networkConfig = testConfig.networkConfig;
    const roundConfigs = {
        'createCit': 20,
        'createCA': 20,
        'createDE': 10,
        'queryAll': 5,
        'queryAllDE': 5,
        'updateCA': 20,
        'removeCA': 20,
        'removeDE': 20
    };

    try {
        const organizations = networkConfig.organizations;
        const peers = networkConfig.peers;

        // Start the test
        for (const roundName of Object.keys(roundConfigs)) {
            const roundCount = roundConfigs[roundName];

            console.log(`Starting round: ${roundName}`);

            switch (roundName) {
                case 'createCit':
                    await executeTransactions(roundCount, createCitTransaction);
                    break;
                case 'createCA':
                    await executeTransactions(roundCount, createCATransaction);
                    break;
                case 'createDE':
                    await executeTransactions(roundCount, createDETransaction);
                    break;
                case 'queryAll':
                    await executeTransactions(roundCount, queryAllTransaction);
                    break;
                case 'queryAllDE':
                    await executeTransactions(roundCount, queryAllDETransaction);
                    break;
                case 'updateCA':
                    await executeTransactions(roundCount, updateCATransaction);
                    break;
                case 'removeCA':
                    await executeTransactions(roundCount, removeCATransaction);
                    break;
                case 'removeDE':
                    await executeTransactions(roundCount, removeDETransaction);
                    break;
                default:
                    console.log(`Unknown round: ${roundName}`);
                    break;
            }
        }

        // Test finished
        console.log('All rounds completed');
    } catch (error) {
        console.error(`Test failed with error: ${error}`);
    }
};

async function executeTransactions(roundCount, transactionFunction) {
    for (let i = 0; i < roundCount; i++) {
        await transactionFunction();
    }
}


module.exports.info = 'Caliper benchmark scenario for 4 organizations, 2 peers network';
