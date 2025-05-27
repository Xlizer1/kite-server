const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com"
});

const db = admin.database();
const messaging = admin.messaging();

module.exports = { db, messaging, admin };