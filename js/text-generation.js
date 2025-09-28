// Text Generation Functionality for AI Agent Website

// Template definitions
const TEMPLATES = {
    "blog-post": {
        title: "Blog Post",
        description: "Create a well-structured blog post with an engaging introduction, informative body, and conclusion.",
        form: [
            {
                type: "text",
                id: "blog-title",
                label: "Blog Title",
                placeholder: "Enter a title for your blog post"
            },
            {
                type: "select",
                id: "blog-category",
                label: "Category",
                options: [
                    { value: "technology", text: "Technology" },
                    { value: "health", text: "Health & Wellness" },
                    { value: "business", text: "Business" },
                    { value: "lifestyle", text: "Lifestyle" },
                    { value: "education", text: "Education" }
                ]
            },
            {
                type: "textarea",
                id: "blog-keywords",
                label: "Keywords (comma separated)",
                placeholder: "Enter keywords related to your topic"
            }
        ],
        generatePrompt: (formData) => {
            return `Write a blog post titled "${formData["blog-title"]}" in the ${formData["blog-category"]} category. 
            Include these keywords: ${formData["blog-keywords"]}. 
            The blog should have an engaging introduction, informative body with subheadings, and a conclusion. 
            Format the blog post with proper Markdown formatting including headers, bullet points where appropriate, and emphasis on key points.`;
        }
    },
    "social-media": {
        title: "Social Media Post",
        description: "Create engaging social media content optimized for your platform of choice.",
        form: [
            {
                type: "select",
                id: "platform",
                label: "Platform",
                options: [
                    { value: "instagram", text: "Instagram" },
                    { value: "twitter", text: "Twitter" },
                    { value: "facebook", text: "Facebook" },
                    { value: "linkedin", text: "LinkedIn" }
                ]
            },
            {
                type: "text",
                id: "topic",
                label: "Topic",
                placeholder: "What is your post about?"
            },
            {
                type: "select",
                id: "post-type",
                label: "Post Type",
                options: [
                    { value: "promotional", text: "Promotional" },
                    { value: "informative", text: "Informative" },
                    { value: "entertaining", text: "Entertaining" },
                    { value: "inspirational", text: "Inspirational" }
                ]
            }
        ],
        generatePrompt: (formData) => {
            const platformSpecifics = {
                instagram: "Include relevant hashtags and an engaging caption that encourages engagement.",
                twitter: "Keep it concise and include relevant hashtags. Make it shareable.",
                facebook: "Write an engaging post that encourages comments and shares.",
                linkedin: "Write a professional post that provides value to a business audience."
            };
            
            return `Create a ${formData["post-type"]} social media post for ${formData["platform"]} about ${formData["topic"]}. 
            ${platformSpecifics[formData["platform"]]}`;
        }
    },
    "email": {
        title: "Email",
        description: "Create professional or marketing emails with compelling subject lines and content.",
        form: [
            {
                type: "select",
                id: "email-type",
                label: "Email Type",
                options: [
                    { value: "newsletter", text: "Newsletter" },
                    { value: "promotional", text: "Promotional" },
                    { value: "welcome", text: "Welcome Email" },
                    { value: "follow-up", text: "Follow-up" },
                    { value: "professional", text: "Professional Communication" }
                ]
            },
            {
                type: "text",
                id: "recipient",
                label: "Recipient",
                placeholder: "Who is this email for? (e.g., customers, colleagues)"
            },
            {
                type: "text",
                id: "email-topic",
                label: "Topic/Purpose",
                placeholder: "What is the main purpose of this email?"
            }
        ],
        generatePrompt: (formData) => {
            return `Write a ${formData["email-type"]} email to ${formData["recipient"]} about ${formData["email-topic"]}. 
            Include a compelling subject line, greeting, body content, and appropriate sign-off. 
            Format the email properly with clear sections and professional language.`;
        }
    },
    "product-description": {
        title: "Product Description",
        description: "Create compelling product descriptions that highlight features and benefits.",
        form: [
            {
                type: "text",
                id: "product-name",
                label: "Product Name",
                placeholder: "Enter the name of your product"
            },
            {
                type: "select",
                id: "product-category",
                label: "Category",
                options: [
                    { value: "electronics", text: "Electronics" },
                    { value: "clothing", text: "Clothing & Fashion" },
                    { value: "home", text: "Home & Kitchen" },
                    { value: "beauty", text: "Beauty & Personal Care" },
                    { value: "software", text: "Software & Digital Products" }
                ]
            },
            {
                type: "textarea",
                id: "key-features",
                label: "Key Features (comma separated)",
                placeholder: "List the main features of your product"
            }
        ],
        generatePrompt: (formData) => {
            return `Write a compelling product description for "${formData["product-name"]}" in the ${formData["product-category"]} category. 
            Highlight these key features: ${formData["key-features"]}. 
            The description should be persuasive, highlight benefits as well as features, and include a strong call to action. 
            Format the description with appropriate sections like Overview, Features, Benefits, and Specifications.`;
        }
    },
    "story": {
        title: "Creative Story",
        description: "Generate a creative story with characters, plot, and setting.",
        form: [
            {
                type: "select",
                id: "story-genre",
                label: "Genre",
                options: [
                    { value: "fantasy", text: "Fantasy" },
                    { value: "sci-fi", text: "Science Fiction" },
                    { value: "mystery", text: "Mystery" },
                    { value: "romance", text: "Romance" },
                    { value: "adventure", text: "Adventure" }
                ]
            },
            {
                type: "text",
                id: "main-character",
                label: "Main Character",
                placeholder: "Describe the main character"
            },
            {
                type: "textarea",
                id: "story-setting",
                label: "Setting",
                placeholder: "Describe where and when the story takes place"
            }
        ],
        generatePrompt: (formData) => {
            return `Write a ${formData["story-genre"]} short story featuring a character described as: ${formData["main-character"]}. 
            The story should be set in ${formData["story-setting"]}. 
            Include a compelling beginning, middle with conflict, and satisfying resolution. 
            Use descriptive language and dialogue to bring the story to life.`;
        }
    },
    "code": {
        title: "Code Example",
        description: "Generate code examples with explanations.",
        form: [
            {
                type: "select",
                id: "programming-language",
                label: "Programming Language",
                options: [
                    { value: "javascript", text: "JavaScript" },
                    { value: "python", text: "Python" },
                    { value: "java", text: "Java" },
                    { value: "csharp", text: "C#" },
                    { value: "php", text: "PHP" },
                    { value: "ruby", text: "Ruby" }
                ]
            },
            {
                type: "text",
                id: "code-purpose",
                label: "Purpose",
                placeholder: "What should the code do?"
            },
            {
                type: "select",
                id: "code-level",
                label: "Complexity Level",
                options: [
                    { value: "beginner", text: "Beginner" },
                    { value: "intermediate", text: "Intermediate" },
                    { value: "advanced", text: "Advanced" }
                ]
            }
        ],
        generatePrompt: (formData) => {
            return `Write a ${formData["code-level"]} level ${formData["programming-language"]} code example that ${formData["code-purpose"]}. 
            Include code comments, proper formatting, and a brief explanation of how the code works. 
            Also include any necessary imports or dependencies, and explain any potential edge cases or optimizations.`;
        }
    }
};

// Text Generator Class
class TextGenerator {
    constructor() {
        // DOM Elements
        this.apiKeyInput = document.getElementById('gemini-api-key');
        this.saveApiKeyBtn = document.getElementById('save-api-key');
        this.promptInput = document.getElementById('text-prompt');
        this.generateBtn = document.getElementById('generate-text');
        this.clearBtn = document.getElementById('clear-text-prompt');
        this.textOutput = document.getElementById('text-output');
        this.copyBtn = document.getElementById('copy-text');
        this.saveBtn = document.getElementById('save-text');
        this.downloadBtn = document.getElementById('download-text');
        this.lengthSelect = document.getElementById('text-length');
        this.toneSelect = document.getElementById('text-tone');
        this.templateCards = document.querySelectorAll('.template-card');
        
        // Template modal elements
        this.templateModal = document.getElementById('template-modal');
        this.templateTitle = document.getElementById('template-title');
        this.templateDescription = document.getElementById('template-description');
        this.templateForm = document.getElementById('template-form');
        this.applyTemplateBtn = document.getElementById('apply-template');
        this.cancelTemplateBtn = document.getElementById('cancel-template');
        this.closeModalBtn = document.querySelector('.close-modal');
        
        // Recent generations container
        this.recentGenerations = document.getElementById('recent-text-generations');
        
        // Current state
        this.currentTemplate = null;
        this.currentGeneration = null;
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // API Key management
        if (this.saveApiKeyBtn) {
            this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        }
        
        // Load API key if exists
        if (this.apiKeyInput) {
            const savedApiKey = localStorage.getItem('gemini-api-key');
            if (savedApiKey) {
                this.apiKeyInput.value = savedApiKey;
            }
        }
        
        // Generate text button click
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateText());
        }
        
        // Clear prompt button click
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearPrompt());
        }
        
        // Copy text button click
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyText());
        }
        
        // Save text button click
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.saveToFavorites());
        }
        
        // Download text button click
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadText());
        }
        
        // Template card click events
        if (this.templateCards) {
            this.templateCards.forEach(card => {
                card.addEventListener('click', () => this.openTemplateModal(card.dataset.template));
            });
        }
        
        // Template modal events
        if (this.applyTemplateBtn) {
            this.applyTemplateBtn.addEventListener('click', () => this.applyTemplate());
        }
        
        if (this.cancelTemplateBtn) {
            this.cancelTemplateBtn.addEventListener('click', () => this.closeTemplateModal());
        }
        
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeTemplateModal());
            
            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === this.templateModal) {
                    this.closeTemplateModal();
                }
            });
        }
        
        // Load recent generations if user is logged in
        firebase.auth().onAuthStateChanged(user => {
            if (user && this.recentGenerations) {
                this.loadRecentGenerations(user.uid);
            }
        });
    }
    
    saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('gemini-api-key', apiKey);
            showNotification('API key saved successfully!', 'success');
        } else {
            showNotification('Please enter a valid API key', 'error');
        }
    }
    
    clearPrompt() {
        if (this.promptInput) {
            this.promptInput.value = '';
            this.promptInput.focus();
        }
    }
    
    async generateText() {
        const apiKey = localStorage.getItem('gemini-api-key');
        const prompt = this.promptInput?.value.trim();
        
        if (!apiKey) {
            showNotification('Please save your Gemini API key first', 'error');
            return;
        }
        
        if (!prompt) {
            showNotification('Please enter a prompt', 'error');
            return;
        }
        
        // Show loading state
        if (this.textOutput) {
            this.textOutput.innerHTML = '<div class="loading"><div class="spinner"></div><p>Generating text...</p></div>';
        }
        
        if (this.generateBtn) {
            this.generateBtn.disabled = true;
            this.generateBtn.innerHTML = 'Generating...';
        }
        
        try {
            // Get length and tone options
            const length = this.lengthSelect?.value || 'medium';
            const tone = this.toneSelect?.value || 'professional';
            
            // Enhance prompt with length and tone
            const enhancedPrompt = this.enhancePrompt(prompt, length, tone);
            
            // Generate text using Gemini API
            const generatedText = await this.generateGeminiText(apiKey, enhancedPrompt);
            
            if (generatedText) {
                this.displayGeneratedText(generatedText);
                
                // Save current generation
                this.currentGeneration = {
                    prompt: prompt,
                    result: generatedText,
                    timestamp: new Date()
                };
                
                // Save to history if user is logged in
                if (firebase.auth().currentUser) {
                    this.saveToHistory(prompt, generatedText);
                       
                       // Also save as conversation for context-aware responses
                       if (typeof saveConversation === "function") {
                           saveConversation(prompt, generatedText);
                       }
                }
            } else {
                throw new Error('Failed to generate text');
            }
        } catch (error) {
            console.error('Text generation error:', error);
            if (this.textOutput) {
                this.textOutput.innerHTML = `<p class="error-text">Error: ${error.message}</p>`;
            }
            showNotification('Failed to generate text. Please check your API key and try again.', 'error');
        } finally {
            if (this.generateBtn) {
                this.generateBtn.disabled = false;
                this.generateBtn.innerHTML = 'Generate Text';
            }
        }
    }
    
    enhancePrompt(prompt, length, tone) {
        let enhancedPrompt = prompt;
        
        // Add length instruction
        if (length === 'short') {
            enhancedPrompt += ' Keep the response concise and brief, around 100-200 words.';
        } else if (length === 'medium') {
            enhancedPrompt += ' Provide a moderate-length response, around 300-500 words.';
        } else if (length === 'long') {
            enhancedPrompt += ' Provide a detailed and comprehensive response, around 700-1000 words.';
        }
        
        // Add tone instruction
        if (tone === 'professional') {
            enhancedPrompt += ' Use a professional and formal tone.';
        } else if (tone === 'casual') {
            enhancedPrompt += ' Use a casual and conversational tone.';
        } else if (tone === 'friendly') {
            enhancedPrompt += ' Use a friendly and approachable tone.';
        } else if (tone === 'humorous') {
            enhancedPrompt += ' Use a humorous and light-hearted tone.';
        } else if (tone === 'formal') {
            enhancedPrompt += ' Use a very formal and academic tone.';
        }
        
        return enhancedPrompt;
    }
    
    async generateGeminiText(apiKey, prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        // Get system instructions if available
        let systemInstructions = "You are Pulasthi 2.0, an advanced AI assistant. You are helpful, friendly, and knowledgeable.";
        
        try {
            if (typeof getSystemInstructions === 'function') {
                systemInstructions = await getSystemInstructions();
            }
        } catch (error) {
            console.error('Error getting system instructions:', error);
        }
        
        // Get conversation history if user is logged in
        let conversationHistory = [];
        
        if (firebase.auth().currentUser && typeof getUserConversations === 'function') {
            try {
                conversationHistory = await getUserConversations(5); // Get last 5 conversations
            } catch (error) {
                console.error('Error getting conversation history:', error);
            }
        }
        
        // Build the request with system instructions and conversation history
        const contents = [];
        
        // Add system instructions
        contents.push({
            role: "model",
            parts: [{ text: systemInstructions }]
        });
        
        // Add conversation history
        if (conversationHistory.length > 0) {
            // Sort by timestamp ascending
            conversationHistory.sort((a, b) => a.timestamp - b.timestamp);
            
            // Add each conversation as a user and model message
            conversationHistory.forEach(conv => {
                contents.push({
                    role: "user",
                    parts: [{ text: conv.userMessage }]
                });
                
                contents.push({
                    role: "model",
                    parts: [{ text: conv.aiResponse }]
                });
            });
        }
        
        // Add current prompt
        contents.push({
            role: "user",
            parts: [{ text: prompt }]
        });
        
        const requestBody = {
            contents: contents,
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
    
    displayGeneratedText(text) {
        if (!this.textOutput) return;
        
        // Format the text with proper line breaks
        const formattedText = text.replace(/\n/g, '<br>');
        this.textOutput.innerHTML = formattedText;
        
        // Enable action buttons
        if (this.copyBtn) this.copyBtn.disabled = false;
        if (this.saveBtn) this.saveBtn.disabled = false;
        if (this.downloadBtn) this.downloadBtn.disabled = false;
        
        // Show success notification
        showNotification('Text generated successfully!', 'success');
    }
    
    copyText() {
        if (!this.textOutput) return;
        
        const text = this.textOutput.innerText;
        if (!text || text.includes('AI-generated text will appear here')) {
            showNotification('No text to copy', 'error');
            return;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => showNotification('Text copied to clipboard!', 'success'))
            .catch(err => {
                console.error('Copy error:', err);
                showNotification('Failed to copy text', 'error');
            });
    }
    
    saveToFavorites() {
        if (!this.currentGeneration || !firebase.auth().currentUser) {
            showNotification('Please generate text first or log in', 'error');
            return;
        }
        
        const userId = firebase.auth().currentUser.uid;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // Save to user's favorites collection
        db.collection('users').doc(userId).collection('favorites').add({
            type: 'text',
            prompt: this.currentGeneration.prompt,
            result: this.currentGeneration.result,
            timestamp: timestamp
        })
        .then(() => {
            showNotification('Text saved to favorites!', 'success');
        })
        .catch(error => {
            console.error('Error saving to favorites:', error);
            showNotification('Failed to save to favorites', 'error');
        });
    }
    
    downloadText() {
        if (!this.textOutput) return;
        
        const text = this.textOutput.innerText;
        if (!text || text.includes('AI-generated text will appear here')) {
            showNotification('No text to download', 'error');
            return;
        }
        
        try {
            // Create a blob with the text content
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-generated-text-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Text downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showNotification('Failed to download text', 'error');
        }
    }
    
    openTemplateModal(templateId) {
        if (!this.templateModal || !TEMPLATES[templateId]) return;
        
        const template = TEMPLATES[templateId];
        this.currentTemplate = templateId;
        
        // Set template title and description
        if (this.templateTitle) this.templateTitle.textContent = template.title;
        if (this.templateDescription) this.templateDescription.textContent = template.description;
        
        // Generate form fields
        if (this.templateForm) {
            this.templateForm.innerHTML = '';
            
            template.form.forEach(field => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', field.id);
                label.textContent = field.label;
                formGroup.appendChild(label);
                
                let input;
                
                if (field.type === 'textarea') {
                    input = document.createElement('textarea');
                    input.rows = 3;
                } else if (field.type === 'select') {
                    input = document.createElement('select');
                    field.options.forEach(option => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option.value;
                        optionEl.textContent = option.text;
                        input.appendChild(optionEl);
                    });
                } else {
                    input = document.createElement('input');
                    input.type = field.type;
                }
                
                input.id = field.id;
                input.name = field.id;
                if (field.placeholder) input.placeholder = field.placeholder;
                
                formGroup.appendChild(input);
                this.templateForm.appendChild(formGroup);
            });
        }
        
        // Show modal
        this.templateModal.style.display = 'block';
    }
    
    closeTemplateModal() {
        if (this.templateModal) {
            this.templateModal.style.display = 'none';
        }
    }
    
    applyTemplate() {
        if (!this.currentTemplate || !this.promptInput) return;
        
        const template = TEMPLATES[this.currentTemplate];
        const formData = {};
        
        // Collect form data
        template.form.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                formData[field.id] = input.value;
            }
        });
        
        // Generate prompt from template
        const generatedPrompt = template.generatePrompt(formData);
        this.promptInput.value = generatedPrompt;
        
        // Close modal
        this.closeTemplateModal();
        
        // Focus on prompt input
        this.promptInput.focus();
        
        showNotification(`${template.title} template applied!`, 'success');
    }
    
    saveToHistory(prompt, result) {
        if (!firebase.auth().currentUser) return;
        
        const userId = firebase.auth().currentUser.uid;
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // Save to user's history collection
        db.collection('users').doc(userId).collection('history').add({
            type: 'text',
            prompt: prompt,
            result: result,
            timestamp: timestamp
        })
        .then(docRef => {
            console.log('Text saved to history with ID:', docRef.id);
            
            // Update user's document with summary
            db.collection('users').doc(userId).update({
                'generationHistory': firebase.firestore.FieldValue.arrayUnion({
                    type: 'text',
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
            .where('type', '==', 'text')
            .orderBy('timestamp', 'desc')
            .limit(5)
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
        generationItem.className = 'text-generation-item';
        generationItem.dataset.id = id;
        
        const timestamp = generation.timestamp ? generation.timestamp.toDate() : new Date();
        const formattedDate = timestamp.toLocaleDateString();
        
        // Get first line as title or truncate prompt
        let title = generation.prompt.split('\n')[0];
        if (title.length > 60) {
            title = title.substring(0, 60) + '...';
        }
        
        // Get preview of result
        let preview = generation.result;
        if (preview.length > 150) {
            preview = preview.substring(0, 150) + '...';
        }
        
        generationItem.innerHTML = `
            <div class="text-generation-header">
                <div class="text-generation-title">${title}</div>
                <div class="text-generation-date">${formattedDate}</div>
            </div>
            <div class="text-generation-preview">${preview}</div>
        `;
        
        // Add click event to view the generation
        generationItem.addEventListener('click', () => {
            this.viewGeneration(generation);
        });
        
        return generationItem;
    }
    
    viewGeneration(generation) {
        // Set prompt input
        if (this.promptInput) {
            this.promptInput.value = generation.prompt;
        }
        
        // Display the generation in the output panel
        this.displayGeneratedText(generation.result);
        
        // Save current generation
        this.currentGeneration = {
            prompt: generation.prompt,
            result: generation.result,
            timestamp: new Date()
        };
        
        // Scroll to output panel
        this.textOutput.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize text generator when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const textGenerator = new TextGenerator();
    
    // Make it globally accessible
    window.textGenerator = textGenerator;
});