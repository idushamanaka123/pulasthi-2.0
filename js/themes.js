// Theme System for Pulasthi 2.0

class ThemeSystem {
    constructor() {
        this.themes = [
            { id: 'cosmic', name: 'Cosmic Purple', icon: 'theme-cosmic' },
            { id: 'ocean', name: 'Ocean Blue', icon: 'theme-ocean' },
            { id: 'sunset', name: 'Sunset Orange', icon: 'theme-sunset' },
            { id: 'forest', name: 'Forest Green', icon: 'theme-forest' },
            { id: 'dark', name: 'Dark Mode', icon: 'theme-dark' },
            { id: 'neon', name: 'Neon', icon: 'theme-neon' }
        ];
        
        this.currentTheme = localStorage.getItem('theme') || 'cosmic';
        this.initThemeSwitcher();
    }
    
    initThemeSwitcher() {
        // Create theme switcher if it doesn't exist
        if (!document.querySelector('.theme-switcher')) {
            this.createThemeSwitcher();
        }
        
        // Apply current theme
        this.setTheme(this.currentTheme);
        
        // Add event listeners to theme options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                
                // Save theme preference to user profile if logged in
                this.saveThemePreference(theme);
            });
        });
    }
    
    createThemeSwitcher() {
        const themeSwitcher = document.createElement('div');
        themeSwitcher.className = 'theme-switcher';
        
        // Create theme options
        this.themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option ${theme.icon}`;
            themeOption.dataset.theme = theme.id;
            themeOption.title = theme.name;
            
            if (theme.id === this.currentTheme) {
                themeOption.classList.add('active');
            }
            
            themeSwitcher.appendChild(themeOption);
        });
        
        // Add theme switcher to body
        document.body.appendChild(themeSwitcher);
    }
    
    setTheme(theme) {
        // Set data-theme attribute on html element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update active state in theme switcher
        document.querySelectorAll('.theme-option').forEach(option => {
            if (option.dataset.theme === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Save theme preference to local storage
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }
    
    saveThemePreference(theme) {
        // Save theme preference to user profile if logged in
        if (firebase.auth().currentUser) {
            const userId = firebase.auth().currentUser.uid;
            
            db.collection('users').doc(userId).update({
                'settings.theme': theme
            })
            .then(() => {
                console.log('Theme preference saved to user profile');
            })
            .catch(error => {
                console.error('Error saving theme preference:', error);
            });
        }
    }
    
    // Load theme from user profile
    loadUserTheme(userId) {
        if (!userId) return;
        
        db.collection('users').doc(userId).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.settings && userData.settings.theme) {
                        this.setTheme(userData.settings.theme);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading user theme:', error);
            });
    }
}

// Initialize theme system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const themeSystem = new ThemeSystem();
    
    // Make it globally accessible
    window.themeSystem = themeSystem;
    
    // Load user theme if logged in
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            themeSystem.loadUserTheme(user.uid);
        }
    });
});