const https = require('https');

const KEEP_ALIVE_URL = 'https://bug-tracker-8msn.onrender.com'; // Replace with your Render server URL

function keepAlive() {
  https.get(KEEP_ALIVE_URL, (res) => {
    console.log(`Keep-alive ping sent. Status code: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Error sending keep-alive ping:', err.message);
  });
}

// Send a keep-alive ping every 30 seconds
setInterval(keepAlive, 30000);