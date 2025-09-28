// Enhanced Authentication Functions for Pulasthi 2.0
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const googleLoginBtn = document.getElementById('google-login');
    const googleSignupBtn = document.getElementById('google-signup');
    const passwordInputs = document.querySelectorAll('.password-input input');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Password visibility toggle
    if (togglePasswordBtns) {
        togglePasswordBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const input = passwordInputs[index];
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                // Toggle eye icon
                const icon = btn.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember')?.checked;
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            // Validate inputs
            if (!email || !password) {
                showFormError(loginForm, 'Please fill in all fields');
                resetButton(submitBtn, originalBtnText);
                return;
            }
            
            // Set persistence
            const persistence = remember ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            firebase.auth().setPersistence(persistence)
                .then(() => {
                    // Sign in user
                    return firebase.auth().signInWithEmailAndPassword(email, password);
                })
                .then((userCredential) => {
                    // Login successful
                    showNotification('Login successful! Redirecting...', 'success');
                    
                    // Redirect to dashboard or home page
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                })
                .catch((error) => {
                    console.error('Login error:', error);
                    let errorMessage = 'Login failed. Please check your credentials.';
                    
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        errorMessage = 'Invalid email or password';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Too many failed login attempts. Please try again later.';
                    } else if (error.code === 'auth/user-disabled') {
                        errorMessage = 'This account has been disabled. Please contact support.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Please enter a valid email address.';
                    }
                    
                    showFormError(loginForm, errorMessage);
                    resetButton(submitBtn, originalBtnText);
                });
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAccepted = document.getElementById('terms').checked;
            
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            
            // Validate inputs
            if (!name || !email || !password || !confirmPassword) {
                showFormError(registerForm, 'Please fill in all fields');
                resetButton(submitBtn, originalBtnText);
                return;
            }
            
            if (password !== confirmPassword) {
                showFormError(registerForm, 'Passwords do not match');
                resetButton(submitBtn, originalBtnText);
                return;
            }
            
            if (checkPasswordStrength(password) === 'weak') {
                showFormError(registerForm, 'Password is too weak. Please use a stronger password.');
                resetButton(submitBtn, originalBtnText);
                return;
            }
            
            if (!termsAccepted) {
                showFormError(registerForm, 'You must accept the Terms of Service and Privacy Policy');
                resetButton(submitBtn, originalBtnText);
                return;
            }
            
            // Create user
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Update profile with name
                    return userCredential.user.updateProfile({
                        displayName: name
                    });
                })
                .then(() => {
                    // Create user document in Firestore
                    const user = firebase.auth().currentUser;
                    return db.collection('users').doc(user.uid).set({
                        name: name,
                        email: user.email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        savedPrompts: [],
                        generationHistory: [],
                        settings: {
                            defaultImageModel: 'prompthero-openjourney',
                            saveHistory: true,
                            theme: 'cosmic'
                        }
                    });
                })
                .then(() => {
                    // Registration successful
                    showNotification('Account created successfully! Redirecting...', 'success');
                    
                    // Send email verification
                    firebase.auth().currentUser.sendEmailVerification()
                        .catch(error => {
                            console.error('Error sending verification email:', error);
                        });
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                })
                .catch((error) => {
                    console.error('Registration error:', error);
                    let errorMessage = 'Registration failed. Please try again.';
                    
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'Email is already in use. Please use a different email or login.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Invalid email address';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                    } else if (error.code === 'auth/operation-not-allowed') {
                        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                    } else if (error.code === 'auth/network-request-failed') {
                        errorMessage = 'Network error. Please check your internet connection.';
                    }
                    
                    showFormError(registerForm, errorMessage);
                    resetButton(submitBtn, originalBtnText);
                });
        });
    }
    
    // Google Sign In
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            signInWithGoogle(provider);
        });
    }
    
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            signInWithGoogle(provider);
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
    
    // Check auth state on page load
    firebase.auth().onAuthStateChanged(user => {
        updateUIForAuthState(user);
    });
});

// Check password strength
function checkPasswordStrength(password) {
    // Password strength criteria
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    // Calculate strength score
    let score = 0;
    if (hasLowerCase) score++;
    if (hasUpperCase) score++;
    if (hasNumbers) score++;
    if (hasSpecialChars) score++;
    if (isLongEnough) score++;
    
    // Determine strength level
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
}

// Show form error message
function showFormError(form, message) {
    // Remove any existing error message
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert before the submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    form.insertBefore(errorDiv, submitBtn);
    
    // Automatically remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode === form) {
            form.removeChild(errorDiv);
        }
    }, 5000);
}

// Show form success message
function showFormSuccess(form, message) {
    // Remove any existing messages
    const existingMsg = form.querySelector('.success-message, .error-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Insert before the submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    form.insertBefore(successDiv, submitBtn);
    
    // Automatically remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode === form) {
            form.removeChild(successDiv);
        }
    }, 5000);
}

// Reset button state
function resetButton(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}

// Logout function
function logoutUser() {
    firebase.auth().signOut()
        .then(() => {
            showNotification('Logged out successfully', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        })
        .catch((error) => {
            console.error('Logout error:', error);
            showNotification('Failed to log out', 'error');
        });
}

// Update UI based on authentication state
function updateUIForAuthState(user) {
    const loggedInElements = document.querySelectorAll('.logged-in');
    const loggedOutElements = document.querySelectorAll('.logged-out');
    
    if (user) {
        // User is logged in
        loggedInElements.forEach(el => el.style.display = 'block');
        loggedOutElements.forEach(el => el.style.display = 'none');
        
        // Update user name and avatar
        const userNameElements = document.querySelectorAll('.user-name');
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        
        userNameElements.forEach(el => {
            el.textContent = user.displayName || 'User';
        });
        
        if (user.photoURL) {
            userAvatarElements.forEach(el => {
                el.src = user.photoURL;
            });
        }
        
        // Load user theme preference
        loadUserTheme(user.uid);
    } else {
        // User is logged out
        loggedInElements.forEach(el => el.style.display = 'none');
        loggedOutElements.forEach(el => el.style.display = 'block');
    }
}

// Google Sign In Function
function signInWithGoogle(provider) {
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Create new user document
                return db.collection('users').doc(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    savedPrompts: [],
                    generationHistory: [],
                    settings: {
                        defaultImageModel: 'prompthero-openjourney',
                        saveHistory: true,
                        theme: 'cosmic'
                    }
                });
            }
        })
        .then(() => {
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        })
        .catch((error) => {
            console.error('Google sign in error:', error);
            showNotification('Google sign in failed. Please try again.', 'error');
        });
}

// Load user theme preference
function loadUserTheme(userId) {
    if (!db) return;
    
    db.collection('users').doc(userId).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                if (userData.settings && userData.settings.theme) {
                    // Apply user's theme preference if theme system is available
                    if (window.themeSystem) {
                        window.themeSystem.setTheme(userData.settings.theme);
                    } else {
                        document.documentElement.setAttribute('data-theme', userData.settings.theme);
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error loading user theme:', error);
        });
}

// Show notification function if not already defined
if (typeof showNotification !== 'function') {
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}