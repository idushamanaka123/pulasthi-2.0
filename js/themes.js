// Pulasthi 2.0 Theme System - Simplified

class PulasthiThemeSystem {
    constructor() {
        // Theme options
        this.themes = [
            { name: 'dark', label: 'Dark Mode' },
            { name: 'cosmic', label: 'Cosmic Purple' },
            { name: 'ocean', label: 'Ocean Blue' },
            { name: 'sunset', label: 'Sunset Orange' },
            { name: 'forest', label: 'Forest Green' },
            { name: 'neon', label: 'Neon' }
        ];
        
        // Sticker collection - reduced to just a few essential stickers
        this.stickers = [
            { url: 'https://media.giphy.com/media/A1vBu3p6FrTSHhxMBT/giphy.gif', alt: 'Robot Sticker' },
            { url: 'https://media.giphy.com/media/phUdy8nONks3eX9X9y/giphy.gif', alt: 'AI Sticker' }
        ];
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create theme switcher
        this.createThemeSwitcher();
        
        // Load saved theme
        this.loadSavedTheme();
        
        // Add animated background
        this.addAnimatedBackground();
    }
    
    createThemeSwitcher() {
        // Create theme switcher container
        const themeSwitcher = document.createElement('div');
        themeSwitcher.className = 'theme-switcher';
        
        // Add theme options
        this.themes.forEach(theme => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option theme-${theme.name}`;
            themeOption.title = theme.label;
            themeOption.setAttribute('data-theme', theme.name);
            
            // Add click event
            themeOption.addEventListener('click', () => {
                this.setTheme(theme.name);
            });
            
            themeSwitcher.appendChild(themeOption);
        });
        
        // Add to body
        document.body.appendChild(themeSwitcher);
    }
    
    setTheme(themeName) {
        // Remove current theme
        document.documentElement.removeAttribute('data-theme');
        
        // Set new theme
        if (themeName !== 'dark') {
            document.documentElement.setAttribute('data-theme', themeName);
        }
        
        // Update active class on theme switcher
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === themeName) {
                option.classList.add('active');
            }
        });
        
        // Save theme preference
        localStorage.setItem('pulasthi-theme', themeName);
        
        // Show notification
        const themeName2 = this.themes.find(t => t.name === themeName)?.label || 'Default';
        showNotification(`Theme changed to ${themeName2}`, 'success');
    }
    
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('pulasthi-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Set default theme to dark
            this.setTheme('dark');
        }
    }
    
    addAnimatedBackground() {
        // Create animated background container
        const animatedBg = document.createElement('div');
        animatedBg.className = 'animated-bg';
        
        // Add shapes
        const shape1 = document.createElement('div');
        shape1.className = 'shape shape-1';
        
        const shape2 = document.createElement('div');
        shape2.className = 'shape shape-2';
        
        const shape3 = document.createElement('div');
        shape3.className = 'shape shape-3';
        
        animatedBg.appendChild(shape1);
        animatedBg.appendChild(shape2);
        animatedBg.appendChild(shape3);
        
        // Add to hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.appendChild(animatedBg);
        }
    }
}

// Initialize theme system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const themeSystem = new PulasthiThemeSystem();
    
    // Make it globally accessible
    window.themeSystem = themeSystem;
    
    // Add notification system if not already present
    if (!window.showNotification) {
        window.showNotification = function(message, type = 'info') {
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
        };
    }
});