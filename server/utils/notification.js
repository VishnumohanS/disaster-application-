const twilio = require('twilio');
const Volunteer = require('../models/Volunteer');

const sendDisasterAlert = async (zone) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from || sid.includes('XXX')) {
    console.warn('⚠️ Twilio credentials missing or using placeholders. SMS not sent.');
    return;
  }

  const client = twilio(sid, token);

  try {
    // 1. Fetch all volunteers with phone numbers
    const volunteers = await Volunteer.find({ phone: { $exists: true, $ne: '' } });
    
    if (volunteers.length === 0) {
      console.log('No volunteers found to notify.');
      return;
    }

    const messageBody = `🚨 RED ALERT: ${zone.zoneName} 🚨\nType: ${zone.disasterType}\nSeverity: ${zone.severityLevel}/5\nLocation: ${zone.location.lat}, ${zone.location.lng}\nPlease stay alert and await instructions.`;

    // 2. Send SMS to each volunteer
    const promises = volunteers.map(v => 
      client.messages.create({
        body: messageBody,
        from: from,
        to: v.phone
      }).catch(err => console.error(`Failed to send SMS to ${v.phone}: ${err.message}`))
    );

    await Promise.allSettled(promises);
    console.log(`✅ Disaster alert SMS sent to ${volunteers.length} volunteers.`);
  } catch (error) {
    console.error(`❌ Twilio Alert Error: ${error.message}`);
  }
};

module.exports = { sendDisasterAlert };
