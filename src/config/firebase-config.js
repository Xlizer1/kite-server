const admin = require('firebase-admin');
const serviceAccount = require('../../kite-be182-firebase-adminsdk-fbsvc-cf98aa7368.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kite-be182-default-rtdb.europe-west1.firebasedatabase.app/"
});

const db = admin.database();
const messaging = admin.messaging();

module.exports = { db, messaging, admin };