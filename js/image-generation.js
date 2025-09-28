// Enhanced Image Generation Functionality for AI Agent Website

// Available image generation models
const IMAGE_MODELS = {
    "prompthero-openjourney": "🚀 OpenJourney (Midjourney Style)",
    "stable-diffusion": "🎯 Stable Diffusion",
    "midjourney": "⚡ Midjourney Style"
};

// Image Generator Class
class ImageGenerator {
    constructor() {
        // DOM Elements - Main page
        this.promptInput = document.getElementById('image-prompt');
        this.modelSelect = document.getElementById('image-model');
        this.generateBtn = document.getElementById('generate-image');
        this.imageOutput = document.getElementById('image-output');
        this.downloadBtn = document.getElementById('download-image');
        this.clearBtn = document.getElementById('clear-prompt');
        this.saveFavoriteBtn = document.getElementById('save-favorite');
        this.shareBtn = document.getElementById('share-image');
        this.ratioSelect = document.getElementById('image-ratio');
        
        // Output info elements
        this.outputPrompt = document.getElementById('output-prompt');
        this.outputModel = document.getElementById('output-model');
        this.outputTime = document.getElementById('output-time');
        
        // Style tags and suggestions
        this.styleTags = document.querySelectorAll('.style-tag');
        this.suggestionTags = document.querySelectorAll('.suggestion-tag');
        
        // Share modal elements
        this.shareModal = document.getElementById('share-modal');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.shareImagePreview = document.getElementById('share-image-preview');
        this.shareLinkInput = document.getElementById('share-link-input');
        this.copyLinkBtn = document.getElementById('copy-link');
        
        // Recent generations container
        this.recentGenerations = document.getElementById('recent-generations');
        
        // Current generation data
        this.currentImage = null;
        this.selectedStyleTags = [];
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Generate image button click
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateImage());
        }
        
        // Download image button click
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadImage());
        }
        
        // Clear prompt button click
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearPrompt());
        }
        
        // Save to favorites button click
        if (this.saveFavoriteBtn) {
            this.saveFavoriteBtn.addEventListener('click', () => this.saveToFavorites());
        }
        
        // Share button click
        if (this.shareBtn) {
            this.shareBtn.addEventListener('click', () => this.openShareModal());
        }
        
        // Close modal button click
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeShareModal());
            
            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === this.shareModal) {
                    this.closeShareModal();
                }
            });
        }
        
        // Copy share link button click
        if (this.copyLinkBtn) {
            this.copyLinkBtn.addEventListener('click', () => this.copyShareLink());
        }
        
        // Style tags click events
        if (this.styleTags) {
            this.styleTags.forEach(tag => {
                tag.addEventListener('click', () => this.toggleStyleTag(tag));
            });
        }
        
        // Suggestion tags click events
        if (this.suggestionTags) {
            this.suggestionTags.forEach(tag => {
                tag.addEventListener('click', () => this.applySuggestion(tag));
            });
        }
        
        // Initialize model selection dropdown
        this.populateModelOptions();
        
        // Load recent generations if user is logged in
        firebase.auth().onAuthStateChanged(user => {
            if (user && this.recentGenerations) {
                this.loadRecentGenerations(user.uid);
            }
        });
    }
    
    populateModelOptions() {
        if (!this.modelSelect) return;
        
        // Clear existing options
        this.modelSelect.innerHTML = '';
        
        // Add model options
        Object.entries(IMAGE_MODELS).forEach(([modelId, modelName]) => {
            const option = document.createElement('option');
            option.value = modelId;
            option.textContent = modelName;
            this.modelSelect.appendChild(option);
        });
    }
    
    toggleStyleTag(tag) {
        const style = tag.dataset.style;
        
        if (tag.classList.contains('active')) {
            // Remove style from selected styles
            tag.classList.remove('active');
            this.selectedStyleTags = this.selectedStyleTags.filter(s => s !== style);
        } else {
            // Add style to selected styles
            tag.classList.add('active');
            this.selectedStyleTags.push(style);
        }
    }
    
    applySuggestion(tag) {
        if (!this.promptInput) return;
        
        const suggestion = tag.dataset.suggestion;
        this.promptInput.value = suggestion;
        
        // Scroll to prompt input
        this.promptInput.scrollIntoView({ behavior: 'smooth' });
        this.promptInput.focus();
    }
    
    clearPrompt() {
        if (!this.promptInput) return;
        
        this.promptInput.value = '';
        this.promptInput.focus();
        
        // Reset style tags
        if (this.styleTags) {
            this.styleTags.forEach(tag => {
                tag.classList.remove('active');
            });
        }
        
        this.selectedStyleTags = [];
    }
    
    async generateImage() {
        if (!this.promptInput || !this.modelSelect || !this.imageOutput) return;
        
        let prompt = this.promptInput.value.trim();
        const model = this.modelSelect.value;
        
        if (!prompt) {
            showNotification('Please enter an image prompt', 'error');
            return;
        }
        
        // Add selected style tags to prompt
        if (this.selectedStyleTags.length > 0) {
            prompt += ', ' + this.selectedStyleTags.join(', ');
        }
        
        // Get aspect ratio if available
        let width = 1024;
        let height = 1024;
        
        if (this.ratioSelect) {
            const ratio = this.ratioSelect.value;
            
            switch (ratio) {
                case '16:9':
                    width = 1024;
                    height = 576;
                    break;
                case '9:16':
                    width = 576;
                    height = 1024;
                    break;
                case '4:3':
                    width = 1024;
                    height = 768;
                    break;
                default:
                    width = 1024;
                    height = 1024;
            }
        }
        
        // Show loading state
        this.imageOutput.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating image...</p></div>';
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = 'Generating...';
        
        try {
            // Generate image using Pollinations AI
            const imageUrl = await this.generatePollinationsImage(prompt, model, width, height);
            
            if (imageUrl) {
                this.displayGeneratedImage(imageUrl, prompt, model);
                
                // Save to history if user is logged in
                if (firebase.auth().currentUser) {
                    this.saveToHistory(prompt, imageUrl, model);
                }
            } else {
                throw new Error('Failed to generate image');
            }
        } catch (error) {
            console.error('Image generation error:', error);
            this.imageOutput.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
            showNotification('Failed to generate image. Please try again with a different prompt.', 'error');
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = 'Generate Image';
        }
    }
    
    generatePollinationsImage(prompt, model, width = 1024, height = 1024) {
        return new Promise((resolve, reject) => {
            try {
                // Encode the prompt for URL
                const encodedPrompt = encodeURIComponent(prompt);
                
                // Create the Pollinations URL
                const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=${width}&height=${height}&nologo=true`;
                
                // Create an image element to test if the URL works
                const img = new Image();
                img.crossOrigin = "anonymous";
                
                img.onload = () => {
                    resolve(imageUrl);
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to generate image'));
                };
                
                img.src = imageUrl;
            } catch (error) {
                reject(error);
            }
        });
    }
    
    displayGeneratedImage(imageUrl, prompt, model) {
        if (!this.imageOutput) return;
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `AI generated image for: ${prompt}`;
        img.crossOrigin = "anonymous";
        
        // Clear output container and add image
        this.imageOutput.innerHTML = '';
        this.imageOutput.appendChild(img);
        
        // Store current image data
        this.currentImage = {
            url: imageUrl,
            prompt: prompt,
            model: model,
            timestamp: new Date()
        };
        
        // Update image info
        if (this.outputPrompt) {
            this.outputPrompt.textContent = prompt;
        }
        
        if (this.outputModel) {
            this.outputModel.textContent = IMAGE_MODELS[model] || model;
        }
        
        if (this.outputTime) {
            this.outputTime.textContent = new Date().toLocaleString();
        }
        
        // Enable download and share buttons
        if (this.downloadBtn) {
            this.downloadBtn.disabled = false;
        }
        
        if (this.shareBtn) {
            this.shareBtn.disabled = false;
        }
        
        // Show success notification
        showNotification('Image generated successfully!', 'success');
    }
    
    downloadImage() {
        const img = this.imageOutput?.querySelector('img');
        if (!img) {
            showNotification('No image to download', 'error');
            return;
        }
        
        try {
            // Create canvas to handle the download
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ai-image-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Image downloaded successfully!', 'success');
            }, 'image/png');
        } catch (error) {
            console.error('Download error:', error);
            showNotification('Failed to download image', 'error');
        }
    }
    
    saveToFavorites() {
        if (!this.currentImage || !firebase.auth().currentUser) {
            showNotification('Please generate an image first or log in', 'error');
            return;
        }
        
        const userId = firebase.auth().currentUser.uid;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // Save to user's favorites collection
        db.collection('users').doc(userId).collection('favorites').add({
            type: 'image',
            prompt: this.currentImage.prompt,
            result: this.currentImage.url,
            model: this.currentImage.model,
            timestamp: timestamp
        })
        .then(() => {
            showNotification('Image saved to favorites!', 'success');
        })
        .catch(error => {
            console.error('Error saving to favorites:', error);
            showNotification('Failed to save to favorites', 'error');
        });
    }
    
    saveToHistory(prompt, imageUrl, model) {
        if (!firebase.auth().currentUser) return;
        
        const userId = firebase.auth().currentUser.uid;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // Save to user's history collection
        db.collection('users').doc(userId).collection('history').add({
            type: 'image',
            prompt: prompt,
            result: imageUrl,
            model: model,
            timestamp: timestamp
        })
        .then(docRef => {
            console.log('Image saved to history with ID:', docRef.id);
            
            // Update user's document with summary
            db.collection('users').doc(userId).update({
                'generationHistory': firebase.firestore.FieldValue.arrayUnion({
                    type: 'image',
                    prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
                    timestamp: timestamp
                })
            });
            
            // Refresh recent generations
            this.loadRecentGenerations(userId);
        })
        .catch(error => {
            console.error('Error saving to history:', error);
        });
    }
    
    loadRecentGenerations(userId) {
        if (!this.recentGenerations) return;
        
        db.collection('users').doc(userId).collection('history')
            .where('type', '==', 'image')
            .orderBy('timestamp', 'desc')
            .limit(6)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    // Show empty state
                    return;
                }
                
                // Clear empty state
                this.recentGenerations.innerHTML = '';
                
                // Add generation items
                snapshot.forEach(doc => {
                    const generation = doc.data();
                    const generationItem = this.createGenerationItem(generation, doc.id);
                    this.recentGenerations.appendChild(generationItem);
                });
            })
            .catch(error => {
                console.error('Error loading recent generations:', error);
            });
    }
    
    createGenerationItem(generation, id) {
        const generationItem = document.createElement('div');
        generationItem.className = 'generation-item';
        generationItem.dataset.id = id;
        
        const timestamp = generation.timestamp ? generation.timestamp.toDate() : new Date();
        const formattedDate = timestamp.toLocaleDateString();
        
        generationItem.innerHTML = `
            <div class="generation-image">
                <img src="${generation.result}" alt="Generated Image">
            </div>
            <div class="generation-info">
                <p>${this.truncateText(generation.prompt, 30)}</p>
                <span class="date">${formattedDate}</span>
            </div>
        `;
        
        // Add click event to view the generation
        generationItem.addEventListener('click', () => {
            this.viewGeneration(generation);
        });
        
        return generationItem;
    }
    
    viewGeneration(generation) {
        // Display the generation in the output panel
        this.displayGeneratedImage(generation.result, generation.prompt, generation.model);
        
        // Scroll to output panel
        this.imageOutput.scrollIntoView({ behavior: 'smooth' });
    }
    
    openShareModal() {
        if (!this.currentImage || !this.shareModal) return;
        
        // Set image preview
        if (this.shareImagePreview) {
            this.shareImagePreview.src = this.currentImage.url;
            this.shareImagePreview.alt = `AI generated image: ${this.currentImage.prompt}`;
        }
        
        // Set share link
        if (this.shareLinkInput) {
            this.shareLinkInput.value = this.currentImage.url;
        }
        
        // Show modal
        this.shareModal.style.display = 'block';
        
        // Set up social share buttons
        document.querySelector('.share-btn.facebook')?.addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.currentImage.url)}`, '_blank');
        });
        
        document.querySelector('.share-btn.twitter')?.addEventListener('click', () => {
            window.open(`https://twitter.com/intent/tweet?text=Check out this AI-generated image!&url=${encodeURIComponent(this.currentImage.url)}`, '_blank');
        });
        
        document.querySelector('.share-btn.pinterest')?.addEventListener('click', () => {
            window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(this.currentImage.url)}&description=${encodeURIComponent('AI-generated image')}`, '_blank');
        });
        
        document.querySelector('.share-btn.reddit')?.addEventListener('click', () => {
            window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(this.currentImage.url)}&title=${encodeURIComponent('AI-generated image')}`, '_blank');
        });
    }
    
    closeShareModal() {
        if (this.shareModal) {
            this.shareModal.style.display = 'none';
        }
    }
    
    copyShareLink() {
        if (!this.shareLinkInput) return;
        
        this.shareLinkInput.select();
        document.execCommand('copy');
        
        showNotification('Link copied to clipboard!', 'success');
    }
    
    // Helper function to truncate text
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialize image generator when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const imageGenerator = new ImageGenerator();
    
    // Make it globally accessible
    window.imageGenerator = imageGenerator;
});