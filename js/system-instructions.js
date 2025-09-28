/**
 * Pulasthi 2.0 - System Instructions Management
 * This file handles the functionality for managing system instructions in the admin panel
 */

class SystemInstructionsManager {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.systemInstructionsRef = this.db.collection('system').doc('instructions');
        this.historyRef = this.db.collection('system').collection('instructionsHistory');
        
        // Elements
        this.mainInstructionsTextarea = document.getElementById('main-instructions-textarea');
        this.personalityTextarea = document.getElementById('personality-textarea');
        this.capabilitiesTextarea = document.getElementById('capabilities-textarea');
        this.limitationsTextarea = document.getElementById('limitations-textarea');
        this.previewContainer = document.getElementById('combined-instructions-preview');
        this.historyList = document.querySelector('.history-list');
        this.saveButton = document.getElementById('save-instructions');
        
        // Initialize
        this.init();
    }
    
    init() {
        // Load current instructions
        this.loadCurrentInstructions();
        
        // Load history
        this.loadInstructionsHistory();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    loadCurrentInstructions() {
        this.systemInstructionsRef.get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    
                    // Populate textareas
                    if (this.mainInstructionsTextarea) {
                        this.mainInstructionsTextarea.value = data.mainInstructions || '';
                    }
                    
                    if (this.personalityTextarea) {
                        this.personalityTextarea.value = data.personality || '';
                    }
                    
                    if (this.capabilitiesTextarea) {
                        this.capabilitiesTextarea.value = data.capabilities || '';
                    }
                    
                    if (this.limitationsTextarea) {
                        this.limitationsTextarea.value = data.limitations || '';
                    }
                    
                    // Update preview
                    this.updatePreview();
                } else {
                    console.log('No system instructions found. Using defaults.');
                }
            })
            .catch(error => {
                console.error('Error loading system instructions:', error);
                showNotification('Error loading system instructions', 'error');
            });
    }
    
    loadInstructionsHistory() {
        this.historyRef.orderBy('createdAt', 'desc').limit(10).get()
            .then(snapshot => {
                if (this.historyList) {
                    // Clear existing history
                    this.historyList.innerHTML = '';
                    
                    if (snapshot.empty) {
                        this.historyList.innerHTML = '<p>No history available yet.</p>';
                        return;
                    }
                    
                    // Add history items
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const date = data.createdAt ? new Date(data.createdAt.toDate()) : new Date();
                        const formattedDate = `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                        
                        const historyItem = document.createElement('div');
                        historyItem.className = 'history-item';
                        historyItem.innerHTML = `
                            <div class="history-item-header">
                                <span class="history-date">${formattedDate}</span>
                                <div class="history-actions">
                                    <button class="btn btn-sm btn-outline view-history" data-id="${doc.id}">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                    <button class="btn btn-sm btn-outline restore-history" data-id="${doc.id}">
                                        <i class="fas fa-undo"></i> Restore
                                    </button>
                                </div>
                            </div>
                            <p class="history-summary">Updated system instructions</p>
                        `;
                        
                        this.historyList.appendChild(historyItem);
                        
                        // Add event listeners to buttons
                        historyItem.querySelector('.view-history').addEventListener('click', () => {
                            this.viewHistoryItem(doc.id);
                        });
                        
                        historyItem.querySelector('.restore-history').addEventListener('click', () => {
                            this.restoreHistoryItem(doc.id);
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error loading instructions history:', error);
            });
    }
    
    setupEventListeners() {
        // Text area change event to update preview
        const textareas = document.querySelectorAll('.system-instructions-textarea');
        if (textareas) {
            textareas.forEach(textarea => {
                textarea.addEventListener('input', () => this.updatePreview());
            });
        }
        
        // Save button
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => this.saveInstructions());
        }
    }
    
    updatePreview() {
        if (!this.previewContainer) return;
        
        const mainInstructions = this.mainInstructionsTextarea ? this.mainInstructionsTextarea.value : '';
        const personality = this.personalityTextarea ? this.personalityTextarea.value : '';
        const capabilities = this.capabilitiesTextarea ? this.capabilitiesTextarea.value : '';
        const limitations = this.limitationsTextarea ? this.limitationsTextarea.value : '';
        
        const combinedInstructions = `
            <h4>Main Instructions:</h4>
            <p>${mainInstructions.replace(/\n/g, '<br>')}</p>
            
            <h4>Personality:</h4>
            <p>${personality.replace(/\n/g, '<br>')}</p>
            
            <h4>Capabilities:</h4>
            <p>${capabilities.replace(/\n/g, '<br>')}</p>
            
            <h4>Limitations:</h4>
            <p>${limitations.replace(/\n/g, '<br>')}</p>
        `;
        
        this.previewContainer.innerHTML = combinedInstructions;
    }
    
    saveInstructions() {
        if (!this.auth.currentUser) {
            showNotification('You must be logged in as an admin to save instructions', 'error');
            return;
        }
        
        const mainInstructions = this.mainInstructionsTextarea ? this.mainInstructionsTextarea.value : '';
        const personality = this.personalityTextarea ? this.personalityTextarea.value : '';
        const capabilities = this.capabilitiesTextarea ? this.capabilitiesTextarea.value : '';
        const limitations = this.limitationsTextarea ? this.limitationsTextarea.value : '';
        
        const systemInstructions = {
            mainInstructions,
            personality,
            capabilities,
            limitations,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: this.auth.currentUser.uid
        };
        
        // Save to Firestore
        this.systemInstructionsRef.set(systemInstructions)
            .then(() => {
                showNotification('System instructions saved successfully', 'success');
                
                // Add to history
                this.historyRef.add({
                    ...systemInstructions,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    // Reload history
                    this.loadInstructionsHistory();
                });
            })
            .catch(error => {
                console.error('Error saving system instructions:', error);
                showNotification('Error saving system instructions', 'error');
            });
    }
    
    viewHistoryItem(id) {
        this.historyRef.doc(id).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const date = data.createdAt ? new Date(data.createdAt.toDate()) : new Date();
                    const formattedDate = `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    
                    // Create modal for viewing
                    const modal = document.createElement('div');
                    modal.className = 'modal';
                    modal.innerHTML = `
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>System Instructions History</h3>
                                <span class="modal-close">&times;</span>
                            </div>
                            <div class="modal-body">
                                <p class="history-date">Date: ${formattedDate}</p>
                                
                                <h4>Main Instructions:</h4>
                                <div class="history-content">${data.mainInstructions.replace(/\n/g, '<br>')}</div>
                                
                                <h4>Personality:</h4>
                                <div class="history-content">${data.personality.replace(/\n/g, '<br>')}</div>
                                
                                <h4>Capabilities:</h4>
                                <div class="history-content">${data.capabilities.replace(/\n/g, '<br>')}</div>
                                
                                <h4>Limitations:</h4>
                                <div class="history-content">${data.limitations.replace(/\n/g, '<br>')}</div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary modal-close-btn">Close</button>
                                <button class="btn btn-primary restore-btn">Restore These Instructions</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    // Add event listeners
                    modal.querySelector('.modal-close').addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });
                    
                    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
                        document.body.removeChild(modal);
                    });
                    
                    modal.querySelector('.restore-btn').addEventListener('click', () => {
                        this.restoreHistoryItem(id);
                        document.body.removeChild(modal);
                    });
                    
                    // Close modal when clicking outside
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            document.body.removeChild(modal);
                        }
                    });
                    
                    // Add modal styles if not already present
                    if (!document.getElementById('modal-styles')) {
                        const style = document.createElement('style');
                        style.id = 'modal-styles';
                        style.innerHTML = `
                            .modal {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background-color: rgba(0, 0, 0, 0.7);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                z-index: 1000;
                            }
                            
                            .modal-content {
                                background-color: var(--bg-color);
                                border-radius: 10px;
                                width: 80%;
                                max-width: 800px;
                                max-height: 90vh;
                                overflow-y: auto;
                                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                            }
                            
                            .modal-header {
                                padding: 1rem;
                                border-bottom: 1px solid var(--border-color);
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            }
                            
                            .modal-close {
                                font-size: 1.5rem;
                                cursor: pointer;
                            }
                            
                            .modal-body {
                                padding: 1.5rem;
                            }
                            
                            .modal-footer {
                                padding: 1rem;
                                border-top: 1px solid var(--border-color);
                                display: flex;
                                justify-content: flex-end;
                                gap: 1rem;
                            }
                            
                            .history-content {
                                background-color: var(--light-bg);
                                padding: 1rem;
                                border-radius: 5px;
                                margin-bottom: 1.5rem;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading history item:', error);
                showNotification('Error loading history item', 'error');
            });
    }
    
    restoreHistoryItem(id) {
        this.historyRef.doc(id).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    
                    // Populate textareas
                    if (this.mainInstructionsTextarea) {
                        this.mainInstructionsTextarea.value = data.mainInstructions || '';
                    }
                    
                    if (this.personalityTextarea) {
                        this.personalityTextarea.value = data.personality || '';
                    }
                    
                    if (this.capabilitiesTextarea) {
                        this.capabilitiesTextarea.value = data.capabilities || '';
                    }
                    
                    if (this.limitationsTextarea) {
                        this.limitationsTextarea.value = data.limitations || '';
                    }
                    
                    // Update preview
                    this.updatePreview();
                    
                    showNotification('Instructions restored from history. Click Save to apply changes.', 'success');
                }
            })
            .catch(error => {
                console.error('Error restoring history item:', error);
                showNotification('Error restoring history item', 'error');
            });
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the system instructions page
    if (document.querySelector('.system-instructions-section')) {
        const systemInstructionsManager = new SystemInstructionsManager();
        
        // Make it globally accessible
        window.systemInstructionsManager = systemInstructionsManager;
    }
});

// Function to get system instructions for use in AI responses
function getSystemInstructions() {
    return firebase.firestore().collection('system').doc('instructions').get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                
                // Combine all instructions into a single string
                return `
                    ${data.mainInstructions || ''}
                    
                    PERSONALITY:
                    ${data.personality || ''}
                    
                    CAPABILITIES:
                    ${data.capabilities || ''}
                    
                    LIMITATIONS:
                    ${data.limitations || ''}
                `;
            } else {
                return 'You are Pulasthi 2.0, an advanced AI assistant. You are helpful, friendly, and knowledgeable.';
            }
        })
        .catch(error => {
            console.error('Error getting system instructions:', error);
            return 'You are Pulasthi 2.0, an advanced AI assistant. You are helpful, friendly, and knowledgeable.';
        });
}