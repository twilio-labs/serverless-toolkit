const actualTwilio = jest.requireActual('twilio');
const twilio: any = jest.genMockFromModule('twilio');

twilio['twiml'] = actualTwilio.twiml;

// mock specific functionality

module.exports = twilio;
