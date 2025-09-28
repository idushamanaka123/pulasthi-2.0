// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Text AI Elements
    const apiKeyInput = document.getElementById('gemini-api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const userPromptInput = document.getElementById('user-prompt');
    const generateTextBtn = document.getElementById('generate-text');
    const textOutput = document.getElementById('text-output');
    const copyTextBtn = document.getElementById('copy-text');
    
    // Image AI Elements
    const imagePromptInput = document.getElementById('image-prompt');
    const imageModelSelect = document.getElementById('image-model');
    const generateImageBtn = document.getElementById('generate-image');
    const imageOutput = document.getElementById('image-output');
    const downloadImageBtn = document.getElementById('download-image');
    
    // Hero Image
    const heroImg = document.getElementById('hero-img');
    
    // Mobile Navigation Toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Scroll Animation
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    // API Key Management
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                localStorage.setItem('gemini-api-key', apiKey);
                showNotification('API key saved successfully!', 'success');
                apiKeyInput.value = ''; // Clear for security
            } else {
                showNotification('Please enter a valid API key', 'error');
            }
        });
    }
    
    // Load API key if exists
    if (apiKeyInput) {
        const savedApiKey = localStorage.getItem('gemini-api-key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }
    }
    
    // Text Generation
    if (generateTextBtn) {
        generateTextBtn.addEventListener('click', async () => {
            const apiKey = localStorage.getItem('gemini-api-key');
            const prompt = userPromptInput.value.trim();
            
            if (!apiKey) {
                showNotification('Please save your Gemini API key first', 'error');
                return;
            }
            
            if (!prompt) {
                showNotification('Please enter a prompt', 'error');
                return;
            }
            
            // Show loading state
            textOutput.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating response...</p></div>';
            generateTextBtn.disabled = true;
            generateTextBtn.innerHTML = 'Generating...';
            
            try {
                const response = await generateGeminiText(apiKey, prompt);
                displayTextResponse(response);
            } catch (error) {
                textOutput.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
                showNotification('Failed to generate text. Please check your API key and try again.', 'error');
            } finally {
                generateTextBtn.disabled = false;
                generateTextBtn.innerHTML = 'Generate Response';
            }
        });
    }
    
    // Copy Text Response
    if (copyTextBtn) {
        copyTextBtn.addEventListener('click', () => {
            const text = textOutput.innerText;
            if (text && !text.includes('AI-generated text will appear here')) {
                navigator.clipboard.writeText(text)
                    .then(() => showNotification('Text copied to clipboard!', 'success'))
                    .catch(err => showNotification('Failed to copy text', 'error'));
            }
        });
    }
    
    // Image Generation
    if (generateImageBtn) {
        generateImageBtn.addEventListener('click', () => {
            const prompt = imagePromptInput.value.trim();
            const model = imageModelSelect.value;
            
            if (!prompt) {
                showNotification('Please enter an image prompt', 'error');
                return;
            }
            
            // Show loading state
            imageOutput.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating image...</p></div>';
            generateImageBtn.disabled = true;
            generateImageBtn.innerHTML = 'Generating...';
            
            try {
                generatePollinationsImage(prompt, model)
                    .then(imageUrl => {
                        displayGeneratedImage(imageUrl);
                    })
                    .catch(error => {
                        imageOutput.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
                        showNotification('Failed to generate image', 'error');
                    })
                    .finally(() => {
                        generateImageBtn.disabled = false;
                        generateImageBtn.innerHTML = 'Generate Image';
                    });
            } catch (error) {
                imageOutput.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
                showNotification('Failed to generate image', 'error');
                generateImageBtn.disabled = false;
                generateImageBtn.innerHTML = 'Generate Image';
            }
        });
    }
    
    // Download Generated Image
    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', () => {
            const img = imageOutput.querySelector('img');
            if (img) {
                const link = document.createElement('a');
                link.href = img.src;
                link.download = 'ai-generated-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                showNotification('No image to download', 'error');
            }
        });
    }
    
    // Load placeholder hero image
    if (heroImg) {
        // Set a placeholder SVG for the hero image
        fetch('https://raw.githubusercontent.com/SamHerbert/SVG-Loaders/master/svg-loaders/three-dots.svg')
            .then(response => response.text())
            .then(svgContent => {
                heroImg.outerHTML = svgContent;
            })
            .catch(error => {
                console.error('Error loading hero image:', error);
            });
    }
});

// Gemini API Integration
async function generateGeminiText(apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }
        
        const data = await response.json();
        
        // Extract the generated text from the response
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No text was generated');
        }
    } catch (error) {
        console.error('Error generating text:', error);
        throw error;
    }
}

// Pollinations AI Image Generation
function generatePollinationsImage(prompt, model) {
    return new Promise((resolve, reject) => {
        try {
            // Encode the prompt for URL
            const encodedPrompt = encodeURIComponent(prompt);
            
            // Create the Pollinations URL
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=1024&height=1024&nologo=true`;
            
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

// Display Functions
function displayTextResponse(text) {
    // Format the text with proper line breaks
    const formattedText = text.replace(/\n/g, '<br>');
    textOutput.innerHTML = formattedText;
}

function displayGeneratedImage(imageUrl) {
    imageOutput.innerHTML = `<img src="${imageUrl}" alt="AI Generated Image" crossorigin="anonymous">`;
}

// Notification System
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

// Add CSS for notifications and loading spinner
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            background-color: #333;
            color: white;
            z-index: 1000;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            background-color: #4CAF50;
        }
        
        .notification.error {
            background-color: #F44336;
        }
        
        .notification.info {
            background-color: #2196F3;
        }
        
        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #6c63ff;
            animation: spin 1s ease-in-out infinite;
            margin-bottom: 15px;
        }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        
        .error-text {
            color: #F44336;
        }
    `;
    document.head.appendChild(style);
});