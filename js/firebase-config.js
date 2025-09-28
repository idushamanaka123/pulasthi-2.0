// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxJK3_GXAkJQBgpxVXq_0zO9DzUUaOEeY",
  authDomain: "pulasthi-2-0.firebaseapp.com",
  projectId: "pulasthi-2-0",
  storageBucket: "pulasthi-2-0.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl",
  measurementId: "G-MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Save conversation to history
function saveConversation(userMessage, aiResponse) {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
  const conversationItem = {
    userMessage,
    aiResponse,
    timestamp
  };
  
  // Add to user's conversations collection
  db.collection("users").doc(userId).collection("conversations").add(conversationItem)
    .then(docRef => {
      console.log("Conversation saved with ID:", docRef.id);
    })
    .catch(error => {
      console.error("Error saving conversation:", error);
    });
}

// Get user's conversation history
function getUserConversations(limit = 10) {
  if (!auth.currentUser) return Promise.reject("User not logged in");
  
  const userId = auth.currentUser.uid;
  
  return db.collection("users").doc(userId).collection("conversations")
    .orderBy("timestamp", "desc")
    .limit(limit)
    .get()
    .then(snapshot => {
      const conversations = [];
      snapshot.forEach(doc => {
        conversations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return conversations;
    });
}

// Save generation to history
function saveToHistory(type, prompt, result) {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
  const historyItem = {
    type, // 'text' or 'image'
    prompt,
    result,
    timestamp
  };
  
  // Add to user's history collection
  db.collection('users').doc(userId).collection('history').add(historyItem)
    .then(docRef => {
      console.log('History item saved with ID:', docRef.id);
    })
    .catch(error => {
      console.error('Error saving to history:', error);
    });
  
  // Also update the user's document with a summary
  db.collection('users').doc(userId).update({
    'generationHistory': firebase.firestore.FieldValue.arrayUnion({
      type,
      prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '..' : ''),
      timestamp
    })
  });
}

// Save item to favorites
function saveToFavorites(type, prompt, result) {
  if (!auth.currentUser) return;
  
  const userId = auth.currentUser.uid;
  const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
  const favoriteItem = {
    type, // 'text' or 'image'
    prompt,
    result,
    timestamp
  };
  
  // Add to user's favorites collection
  db.collection('users').doc(userId).collection('favorites').add(favoriteItem)
    .then(docRef => {
      console.log('Favorite item saved with ID:', docRef.id);
      showNotification('Item saved to favorites', 'success');
    })
    .catch(error => {
      console.error('Error saving to favorites:', error);
      showNotification('Failed to save to favorites', 'error');
    });
}

// Check if user is admin
function checkAdminStatus(userId) {
  return db.collection('admins').doc(userId).get()
    .then(doc => {
      return doc.exists;
    })
    .catch(error => {
      console.error('Error checking admin status:', error);
      return false;
    });
}

// Load user data from Firestore
function loadUserData(userId) {
  if (!userId) return Promise.reject('No user ID provided');
  
  return db.collection('users').doc(userId).get()
    .then(doc => {
      if (doc.exists) {
        return doc.data();
      } else {
        // Create new user document if it doesn't exist
        const userData = {
          email: auth.currentUser?.email || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          savedPrompts: [],
          generationHistory: [],
          settings: {
            defaultImageModel: 'prompthero-openjourney',
            saveHistory: true,
            theme: 'cosmic'
          }
        };
        
        return db.collection('users').doc(userId).set(userData)
          .then(() => userData);
      }
    });
}

// Get system instructions for AI
function getSystemInstructions() {
  return Promise.resolve(
    "You are Pulasthi 2.0, an advanced AI assistant created to help users with various tasks. " +
    "You are helpful, creative, friendly, and knowledgeable. " +
    "You provide detailed, accurate responses and can assist with writing, coding, information, and creative tasks. " +
    "Always be respectful and supportive in your responses."
  );
}