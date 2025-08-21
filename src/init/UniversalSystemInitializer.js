/**
 * Universal System Initializer
 * Orchestrates the initialization of all universal audio and interaction systems
 * Connects to all 4 visualization systems with their unique capabilities
 */

import { UniversalAudioEngine } from '../audio/UniversalAudioEngine.js';
import { UniversalInteractionEngine } from '../interactions/UniversalInteractionEngine.js';

export class UniversalSystemInitializer {
    constructor() {
        this.audioEngine = null;
        this.interactionEngine = null;
        this.isInitialized = false;
        this.connectedSystems = new Set();
        
        console.log('🚀 Universal System Initializer created');
    }
    
    /**
     * Initialize all universal systems
     */
    async initialize() {
        console.log('🌌 Initializing Universal Systems for all VIB34D visualizations...');
        
        try {
            // Initialize Universal Audio Engine
            this.audioEngine = new UniversalAudioEngine();
            window.universalAudio = this.audioEngine;
            
            const audioSuccess = await this.audioEngine.initialize();
            if (audioSuccess) {
                console.log('✅ Universal Audio Engine initialized with microphone access');
            } else {
                console.log('⚠️ Universal Audio Engine initialized without microphone (user denied access)');
            }
            
            // Initialize Universal Interaction Engine
            this.interactionEngine = new UniversalInteractionEngine();
            window.universalInteractions = this.interactionEngine;
            this.interactionEngine.initialize();
            
            console.log('✅ Universal Interaction Engine initialized');
            
            // Start audio processing loop
            this.startAudioProcessing();
            
            this.isInitialized = true;
            console.log('🎉 Universal Systems fully initialized and ready');
            
            // Notify that systems are ready
            this.notifySystemsReady();
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Universal Systems:', error);
            return false;
        }
    }
    
    /**
     * Start the audio processing loop
     */
    startAudioProcessing() {
        if (!this.audioEngine) return;
        
        const processAudio = () => {
            this.audioEngine.update();
            requestAnimationFrame(processAudio);
        };
        
        processAudio();
        console.log('🎵 Universal Audio processing loop started');
    }
    
    /**
     * Notify existing systems that universal systems are ready
     */
    notifySystemsReady() {
        // Dispatch custom event to notify systems
        const event = new CustomEvent('universalSystemsReady', {
            detail: {
                audio: this.audioEngine,
                interactions: this.interactionEngine
            }
        });
        
        window.dispatchEvent(event);
        console.log('📢 Universal Systems ready event dispatched');
    }
    
    /**
     * Create UI controls for universal systems
     */
    createControls() {
        // Check if controls container exists
        let controlsContainer = document.getElementById('universalControls');
        
        if (!controlsContainer) {
            // Create controls container if it doesn't exist
            controlsContainer = document.createElement('div');
            controlsContainer.id = 'universalControls';
            controlsContainer.className = 'universal-controls';
            
            // Add to the main controls panel
            const mainControls = document.querySelector('.controls') || document.body;
            mainControls.appendChild(controlsContainer);
        }
        
        controlsContainer.innerHTML = `
            <div class="universal-controls-section">
                <h3>🎵 Universal Audio</h3>
                <div class="control-row">
                    <label>
                        <input type="checkbox" id="audioEnabled" checked>
                        Enable Audio Reactivity
                    </label>
                    <button id="requestMicrophone" class="btn-primary">
                        🎤 Request Microphone Access
                    </button>
                </div>
                <div class="audio-visualizer" id="audioVisualizer">
                    <div class="frequency-bars">
                        <div class="freq-bar" id="bassBar"><span>Bass</span></div>
                        <div class="freq-bar" id="midBar"><span>Mid</span></div>
                        <div class="freq-bar" id="highBar"><span>High</span></div>
                        <div class="freq-bar" id="energyBar"><span>Energy</span></div>
                    </div>
                </div>
                
                <h3>🖱️ Universal Interactions</h3>
                <div class="control-row">
                    <label>
                        <input type="checkbox" id="interactionsEnabled" checked>
                        Enable Advanced Interactions
                    </label>
                    <span class="interaction-status" id="interactionStatus">
                        Mouse + Touch Ready
                    </span>
                </div>
                
                <div class="system-status" id="systemStatus">
                    <h4>Connected Systems:</h4>
                    <div class="status-grid">
                        <div class="system-card faceted">
                            <span class="system-name">🔷 Faceted</span>
                            <span class="status-indicator" id="facetedStatus">⏳</span>
                        </div>
                        <div class="system-card quantum">
                            <span class="system-name">🌌 Quantum</span>
                            <span class="status-indicator" id="quantumStatus">⏳</span>
                        </div>
                        <div class="system-card holographic">
                            <span class="system-name">✨ Holographic</span>
                            <span class="status-indicator" id="holographicStatus">⏳</span>
                        </div>
                        <div class="system-card polychora">
                            <span class="system-name">🔮 Polychora</span>
                            <span class="status-indicator" id="polychoraStatus">⏳</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Set up event listeners
        this.setupControlEventListeners();
        
        // Start status monitoring
        this.startStatusMonitoring();
        
        console.log('🎛️ Universal system controls created');
    }
    
    /**
     * Set up event listeners for controls
     */
    setupControlEventListeners() {
        // Audio enable/disable
        const audioToggle = document.getElementById('audioEnabled');
        if (audioToggle) {
            audioToggle.addEventListener('change', (e) => {
                if (this.audioEngine) {
                    this.audioEngine.setEnabled(e.target.checked);
                }
            });
        }
        
        // Microphone request button
        const micButton = document.getElementById('requestMicrophone');
        if (micButton) {
            micButton.addEventListener('click', async () => {
                if (this.audioEngine) {
                    const success = await this.audioEngine.initialize();
                    micButton.textContent = success ? '🎤 Microphone Connected' : '🎤 Access Denied';
                    micButton.disabled = success;
                }
            });
        }
        
        // Interactions enable/disable
        const interactionsToggle = document.getElementById('interactionsEnabled');
        if (interactionsToggle) {
            interactionsToggle.addEventListener('change', (e) => {
                if (this.interactionEngine) {
                    this.interactionEngine.setEnabled(e.target.checked);
                }
            });
        }
    }
    
    /**
     * Start monitoring system status
     */
    startStatusMonitoring() {
        const updateStatus = () => {
            // Update audio visualization
            if (this.audioEngine && this.audioEngine.isActive) {
                const features = this.audioEngine.getAudioFeatures();
                this.updateAudioVisualization(features);
            }
            
            // Update system connection status
            this.updateSystemStatus();
            
            requestAnimationFrame(updateStatus);
        };
        
        updateStatus();
    }
    
    /**
     * Update audio visualization bars
     */
    updateAudioVisualization(features) {
        const bassBar = document.getElementById('bassBar');
        const midBar = document.getElementById('midBar');
        const highBar = document.getElementById('highBar');
        const energyBar = document.getElementById('energyBar');
        
        if (bassBar) bassBar.style.setProperty('--intensity', features.bass);
        if (midBar) midBar.style.setProperty('--intensity', features.mid);
        if (highBar) highBar.style.setProperty('--intensity', features.high);
        if (energyBar) energyBar.style.setProperty('--intensity', features.energy);
    }
    
    /**
     * Update system connection status
     */
    updateSystemStatus() {
        const systems = ['faceted', 'quantum', 'holographic', 'polychora'];
        
        systems.forEach(systemName => {
            const statusElement = document.getElementById(`${systemName}Status`);
            if (statusElement) {
                const audioConnected = this.audioEngine && this.audioEngine.connectedSystems.has(systemName);
                const interactionConnected = this.interactionEngine && this.interactionEngine.connectedSystems.has(systemName);
                
                if (audioConnected && interactionConnected) {
                    statusElement.textContent = '✅';
                    statusElement.title = 'Audio + Interactions Connected';
                } else if (audioConnected || interactionConnected) {
                    statusElement.textContent = '⚡';
                    statusElement.title = 'Partially Connected';
                } else {
                    statusElement.textContent = '⏳';
                    statusElement.title = 'Connecting...';
                }
            }
        });
    }
    
    /**
     * Enable/disable audio processing
     */
    setAudioEnabled(enabled) {
        if (this.audioEngine) {
            this.audioEngine.setEnabled(enabled);
        }
    }
    
    /**
     * Enable/disable interaction processing
     */
    setInteractionsEnabled(enabled) {
        if (this.interactionEngine) {
            this.interactionEngine.setEnabled(enabled);
        }
    }
    
    /**
     * Get current system status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            audioActive: this.audioEngine?.isActive || false,
            interactionsActive: this.interactionEngine?.isActive || false,
            connectedSystems: Array.from(this.connectedSystems),
            audioFeatures: this.audioEngine?.getAudioFeatures() || null,
            interactionState: this.interactionEngine?.getInteractionState() || null
        };
    }
    
    /**
     * Clean up all universal systems
     */
    destroy() {
        if (this.audioEngine) {
            this.audioEngine.destroy();
            delete window.universalAudio;
        }
        
        if (this.interactionEngine) {
            this.interactionEngine.destroy();
            delete window.universalInteractions;
        }
        
        this.connectedSystems.clear();
        this.isInitialized = false;
        
        console.log('🧹 Universal System Initializer destroyed');
    }
}

// Global initializer instance
let universalInitializer = null;

/**
 * Initialize universal systems (call this from main application)
 */
export async function initializeUniversalSystems() {
    if (universalInitializer) {
        console.log('⚠️ Universal Systems already initialized');
        return universalInitializer;
    }
    
    universalInitializer = new UniversalSystemInitializer();
    const success = await universalInitializer.initialize();
    
    if (success) {
        // Create controls after a short delay to ensure DOM is ready
        setTimeout(() => {
            universalInitializer.createControls();
        }, 100);
    }
    
    return universalInitializer;
}

/**
 * Get the current universal initializer instance
 */
export function getUniversalInitializer() {
    return universalInitializer;
}

// Auto-initialize when this module is imported
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeUniversalSystems();
        });
    } else {
        // DOM is already ready
        setTimeout(() => initializeUniversalSystems(), 100);
    }
}