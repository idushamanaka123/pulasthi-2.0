// Admin Panel Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            checkAdminStatus(user.uid);
        } else {
            // Redirect to login if not logged in
            window.location.href = '../login.html';
        }
    });
    
    // Initialize charts and data
    initializeAdminDashboard();
    
    // Add event listeners for admin actions
    setupEventListeners();
});

// Check if user has admin privileges
function checkAdminStatus(userId) {
    db.collection('admins').doc(userId).get()
        .then(doc => {
            if (!doc.exists) {
                // Not an admin, redirect to home
                showNotification('You do not have admin privileges', 'error');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 2000);
            } else {
                // User is admin, load admin data
                loadAdminData();
            }
        })
        .catch(error => {
            console.error('Error checking admin status:', error);
            showNotification('Error verifying admin status', 'error');
        });
}

// Load admin dashboard data
function loadAdminData() {
    // Load user statistics
    loadUserStats();
    
    // Load generation statistics
    loadGenerationStats();
    
    // Initialize activity chart
    initializeActivityChart();
}

// Load user statistics
function loadUserStats() {
    db.collection('users').get()
        .then(snapshot => {
            const totalUsers = snapshot.size;
            document.getElementById('total-users').textContent = formatNumber(totalUsers);
            
            // Count new users today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let newUsersToday = 0;
            snapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.createdAt && userData.createdAt.toDate() >= today) {
                    newUsersToday++;
                }
            });
            
            document.getElementById('new-users').textContent = newUsersToday;
        })
        .catch(error => {
            console.error('Error loading user stats:', error);
        });
}

// Load generation statistics
function loadGenerationStats() {
    // Text generations count
    db.collectionGroup('history')
        .where('type', '==', 'text')
        .get()
        .then(snapshot => {
            document.getElementById('text-generations').textContent = formatNumber(snapshot.size);
        })
        .catch(error => {
            console.error('Error loading text generation stats:', error);
        });
    
    // Image generations count
    db.collectionGroup('history')
        .where('type', '==', 'image')
        .get()
        .then(snapshot => {
            document.getElementById('image-generations').textContent = formatNumber(snapshot.size);
        })
        .catch(error => {
            console.error('Error loading image generation stats:', error);
        });
}

// Initialize activity chart
function initializeActivityChart() {
    const chartElement = document.getElementById('activity-chart');
    if (!chartElement) return;
    
    // Clear placeholder
    chartElement.innerHTML = '';
    
    // Create canvas for Chart.js
    const canvas = document.createElement('canvas');
    chartElement.appendChild(canvas);
    
    // Get last 7 days
    const dates = getLast7Days();
    
    // Sample data - in a real app, this would come from the database
    const textData = [45, 62, 78, 54, 89, 76, 92];
    const imageData = [32, 48, 56, 67, 42, 51, 63];
    
    // Create chart
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates.map(date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Text Generations',
                    data: textData,
                    borderColor: '#6c63ff',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Image Generations',
                    data: imageData,
                    borderColor: '#ff6584',
                    backgroundColor: 'rgba(255, 101, 132, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Setup event listeners for admin actions
function setupEventListeners() {
    // Action buttons in user table
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const action = this.classList.contains('view-btn') ? 'view' :
                          this.classList.contains('edit-btn') ? 'edit' :
                          this.classList.contains('delete-btn') ? 'delete' : '';
            
            const row = this.closest('tr');
            const userName = row.querySelector('.user-cell span').textContent;
            const userEmail = row.querySelector('td:nth-child(2)').textContent;
            
            switch(action) {
                case 'view':
                    viewUser(userName, userEmail);
                    break;
                case 'edit':
                    editUser(userName, userEmail);
                    break;
                case 'delete':
                    deleteUser(userName, userEmail);
                    break;
            }
        });
    });
    
    // Export data button
    const exportBtn = document.querySelector('.header-actions .btn-primary');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
}

// View user details
function viewUser(name, email) {
    showNotification(`Viewing user: ${name} (${email})`, 'info');
    // In a real app, this would open a modal with user details
}

// Edit user
function editUser(name, email) {
    showNotification(`Editing user: ${name} (${email})`, 'info');
    // In a real app, this would open a modal with user edit form
}

// Delete user
function deleteUser(name, email) {
    if (confirm(`Are you sure you want to delete user ${name} (${email})?`)) {
        showNotification(`User deletion would happen here in a real app`, 'warning');
        // In a real app, this would delete the user from Firebase
    }
}

// Export data
function exportData() {
    showNotification('Preparing data export...', 'info');
    
    // In a real app, this would generate a CSV or JSON export
    setTimeout(() => {
        const dummyData = {
            users: [
                { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' }
            ],
            generations: {
                text: 8392,
                image: 5721
            }
        };
        
        // Create a blob with the JSON data
        const blob = new Blob([JSON.stringify(dummyData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `aiagent-export-${formatDate(new Date())}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully!', 'success');
    }, 1500);
}

// Helper Functions

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get array of last 7 days
function getLast7Days() {
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        result.push(d);
    }
    return result;
}

// Format date for filenames
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
