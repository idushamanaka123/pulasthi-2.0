// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            updateDashboardUI(user);
            loadUserData(user.uid);
        } else {
            // User is not signed in, redirect to login
            window.location.href = 'login.html';
        }
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
    
    // Mobile sidebar toggle
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // New Generation button
    const newGenerationBtn = document.querySelector('.header-actions .btn-primary');
    if (newGenerationBtn) {
        newGenerationBtn.addEventListener('click', () => {
            window.location.href = 'index.html#text-ai';
        });
    }
});

// Update dashboard UI with user info
function updateDashboardUI(user) {
    // Update user info in sidebar
    document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = user.displayName || 'User';
    });
    
    document.querySelectorAll('.user-email').forEach(el => {
        el.textContent = user.email;
    });
    
    // Update user avatar if available
    if (user.photoURL) {
        document.querySelectorAll('.user-avatar').forEach(el => {
            el.src = user.photoURL;
        });
    }
    
    // Check if user is admin
    checkAdminStatus(user.uid).then(isAdmin => {
        if (isAdmin) {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'block';
            });
        }
    });
}

// Load user data from Firestore
function loadUserData(userId) {
    // Get user document
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Update member since date
                if (userData.createdAt) {
                    const memberSince = document.getElementById('member-since');
                    if (memberSince) {
                        const date = userData.createdAt.toDate();
                        memberSince.textContent = formatDate(date);
                    }
                }
                
                // Load user stats
                loadUserStats(userId);
                
                // Load recent activity
                loadRecentActivity(userId);
                
                // Load favorites
                loadFavorites(userId);
            }
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            showNotification('Failed to load user data', 'error');
        });
}

// Load user statistics
function loadUserStats(userId) {
    // Text generations count
    db.collection('users').doc(userId).collection('history')
        .where('type', '==', 'text')
        .get()
        .then(snapshot => {
            const textGenerationsCount = document.getElementById('text-generations-count');
            if (textGenerationsCount) {
                textGenerationsCount.textContent = snapshot.size;
            }
        });
    
    // Image generations count
    db.collection('users').doc(userId).collection('history')
        .where('type', '==', 'image')
        .get()
        .then(snapshot => {
            const imageGenerationsCount = document.getElementById('image-generations-count');
            if (imageGenerationsCount) {
                imageGenerationsCount.textContent = snapshot.size;
            }
        });
    
    // Favorites count
    db.collection('users').doc(userId).collection('favorites')
        .get()
        .then(snapshot => {
            const favoritesCount = document.getElementById('favorites-count');
            if (favoritesCount) {
                favoritesCount.textContent = snapshot.size;
            }
        });
}

// Load recent activity
function loadRecentActivity(userId) {
    const activityList = document.getElementById('recent-activity-list');
    if (!activityList) return;
    
    db.collection('users').doc(userId).collection('history')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                // Show empty state
                return;
            }
            
            // Clear empty state
            activityList.innerHTML = '';
            
            // Add activity items
            snapshot.forEach(doc => {
                const activity = doc.data();
                const activityItem = createActivityItem(activity);
                activityList.appendChild(activityItem);
            });
        })
        .catch(error => {
            console.error('Error loading recent activity:', error);
        });
}

// Create activity item element
function createActivityItem(activity) {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    const icon = activity.type === 'text' ? 'comment-alt' : 'image';
    const title = activity.type === 'text' ? 'Text Generation' : 'Image Generation';
    
    const timestamp = activity.timestamp ? formatTimeAgo(activity.timestamp.toDate()) : 'Unknown time';
    
    activityItem.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="activity-content">
            <h4>${title}</h4>
            <p>${truncateText(activity.prompt, 100)}</p>
            <span class="activity-time">${timestamp}</span>
        </div>
    `;
    
    return activityItem;
}

// Load favorites
function loadFavorites(userId) {
    const favoritesGrid = document.getElementById('favorites-grid');
    if (!favoritesGrid) return;
    
    db.collection('users').doc(userId).collection('favorites')
        .orderBy('timestamp', 'desc')
        .limit(6)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                // Show empty state
                return;
            }
            
            // Clear empty state
            favoritesGrid.innerHTML = '';
            
            // Add favorite items
            snapshot.forEach(doc => {
                const favorite = doc.data();
                const favoriteItem = createFavoriteItem(favorite, doc.id);
                favoritesGrid.appendChild(favoriteItem);
            });
        })
        .catch(error => {
            console.error('Error loading favorites:', error);
        });
}

// Create favorite item element
function createFavoriteItem(favorite, id) {
    const favoriteItem = document.createElement('div');
    favoriteItem.className = 'favorite-item';
    favoriteItem.dataset.id = id;
    
    let content;
    
    if (favorite.type === 'image' && favorite.result) {
        content = `
            <div class="favorite-image">
                <img src="${favorite.result}" alt="AI Generated Image">
            </div>
            <div class="favorite-info">
                <h4>${truncateText(favorite.prompt, 30)}</h4>
                <p>Image Generation</p>
            </div>
        `;
    } else {
        content = `
            <div class="favorite-image">
                <i class="fas fa-${favorite.type === 'text' ? 'comment-alt' : 'image'}"></i>
            </div>
            <div class="favorite-info">
                <h4>${truncateText(favorite.prompt, 30)}</h4>
                <p>${favorite.type === 'text' ? 'Text Generation' : 'Image Generation'}</p>
            </div>
        `;
    }
    
    favoriteItem.innerHTML = content;
    
    // Add click event to view the favorite
    favoriteItem.addEventListener('click', () => {
        viewFavoriteItem(favorite, id);
    });
    
    return favoriteItem;
}

// View favorite item details
function viewFavoriteItem(favorite, id) {
    // This would typically open a modal or navigate to a details page
    console.log('Viewing favorite:', favorite);
    
    // For now, we'll just show a notification
    showNotification('Favorite item details coming soon!', 'info');
}

// Helper Functions

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

// Truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}