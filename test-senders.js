const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.SendersApi();

apiInstance.getSenders().then(function (data) {
    console.log('Senders retrieved successfully:');
    data.senders.forEach(sender => {
        console.log(`- ${sender.name} (${sender.email}) - Active: ${sender.active}`);
    });
}, function (error) {
    console.error('Error fetching senders:', error?.response?.body || error);
});
