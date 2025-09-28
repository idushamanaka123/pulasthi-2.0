// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxJK3_GXAkJQBgpxVXq_0zO9DzUUaOEeY",
  authDomain: "ai-agent-website.firebaseapp.com",
  projectId: "ai-agent-website",
  storageBucket: "ai-agent-website.appspot.com",
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

// Auth state observer
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    console.log('User logged in:', user.email);
    updateUIForLoggedInUser(user);
  } else {
    // User is signed out
    console.log('User logged out');
    updateUIForLoggedOutUser();
  }
});

// Update UI based on auth state
function updateUIForLoggedInUser(user) {
  // Show user-specific elements
  document.querySelectorAll('.logged-in').forEach(item => item.style.display = 'block');
  document.querySelectorAll('.logged-out').forEach(item => item.style.display = 'none');
  
  // Update user info displays
  document.querySelectorAll('.user-email').forEach(item => {
    item.textContent = user.email;
  });
  
  // If user has a display name
  if (user.displayName) {
    document.querySelectorAll('.user-name').forEach(item => {
      item.textContent = user.displayName;
    });
  }
  
  // If user has a profile picture
  if (user.photoURL) {
    document.querySelectorAll('.user-avatar').forEach(item => {
      item.src = user.photoURL;
    });
  }
  
  // Load user data from Firestore
  loadUserData(user.uid);
}

function updateUIForLoggedOutUser() {
  // Show non-user-specific elements
  document.querySelectorAll('.logged-out').forEach(item => item.style.display = 'block');
  document.querySelectorAll('.logged-in').forEach(item => item.style.display = 'none');
  
  // Clear user data from UI
  document.querySelectorAll('.user-email, .user-name').forEach(item => {
    item.textContent = '';
  });
  
  document.querySelectorAll('.user-avatar').forEach(item => {
    item.src = 'images/default-avatar.png';
  });
}

// Load user data from Firestore
function loadUserData(userId) {
  db.collection('users').doc(userId).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        console.log('User data:', userData);
        
        // Update UI with user data
        if (userData.savedPrompts) {
          // Update saved prompts UI
        }
        
        if (userData.generationHistory) {
          // Update history UI
        }
        
        if (userData.settings) {
          // Apply user settings
        }
      } else {
        // Create new user document
        db.collection('users').doc(userId).set({
          email: auth.currentUser.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          savedPrompts: [],
          generationHistory: [],
          settings: {
            defaultImageModel: 'prompthero-openjourney',
            saveHistory: true
          }
        });
      }
    })
    .catch(error => {
      console.error('Error loading user data:', error);
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
      prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
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
