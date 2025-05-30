const { db, messaging, admin } = require('./firebase-config');

// Test database connection
async function testConnection() {
  try {
    const ref = db.ref('test');
    await ref.set({ message: 'Hello Firebase!' });
    console.log('✅ Firebase connected successfully!');
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
  }
}

testConnection();