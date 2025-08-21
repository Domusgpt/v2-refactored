/**
 * GalleryTiltController - Smooth accelerometer-based card tilt system
 * Creates subtle, elegant card movements based on device orientation
 */

export class GalleryTiltController {
    constructor() {
        this.isActive = false;
        this.currentTilt = { x: 0, y: 0, z: 0 };
        this.smoothedTilt = { x: 0, y: 0, z: 0 };
        this.sensitivity = 0.8; // Reduced sensitivity for smoother effect
        this.smoothingFactor = 0.12; // Increased smoothing for elegance
        this.cards = [];
        
        console.log('🎴 GalleryTiltController initialized');
    }
    
    /**
     * Initialize tilt system for gallery cards
     */
    init() {
        if (this.isActive) return;
        
        console.log('🎴 Activating gallery tilt control');
        this.isActive = true;
        
        // Find all gallery cards
        this.updateCardList();
        
        // Setup device orientation listener
        this.setupDeviceOrientation();
        
        // Start smooth update loop
        this.startUpdateLoop();
    }
    
    /**
     * Update the list of cards to control
     */
    updateCardList() {
        this.cards = Array.from(document.querySelectorAll('.variation-card'));
        console.log(`🎴 Found ${this.cards.length} cards to control`);
    }
    
    /**
     * Deactivate tilt system
     */
    deactivate() {
        if (!this.isActive) return;
        
        console.log('🎴 Deactivating gallery tilt control');
        this.isActive = false;
        
        // Reset all cards to neutral position
        this.resetCardsToNeutral();
    }
    
    /**
     * Setup device orientation event listener
     */
    setupDeviceOrientation() {
        // Check for device orientation support
        if (!('DeviceOrientationEvent' in window)) {
            console.warn('⚠️ Device orientation not supported');
            return;
        }
        
        // Request permission on iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        this.attachOrientationListener();
                    } else {
                        console.warn('⚠️ Device orientation permission denied');
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS or older iOS
            this.attachOrientationListener();
        }
    }
    
    /**
     * Attach the actual orientation event listener
     */
    attachOrientationListener() {
        window.addEventListener('deviceorientation', (event) => {
            if (!this.isActive) return;
            
            // Get device orientation values
            const beta = event.beta || 0;   // X-axis rotation (-180 to 180)
            const gamma = event.gamma || 0; // Y-axis rotation (-90 to 90)
            
            // Normalize values with larger deadzone for stability
            this.currentTilt.x = this.applyDeadzone(beta, 8) / 90;   // Normalize to -2 to 2
            this.currentTilt.y = this.applyDeadzone(gamma, 5) / 45;  // Normalize to -2 to 2
            
        }, { passive: true });
        
        console.log('✅ Gallery tilt orientation listener attached');
    }
    
    /**
     * Apply deadzone to prevent jitter when device is nearly level
     */
    applyDeadzone(value, deadzone) {
        return Math.abs(value) < deadzone ? 0 : value;
    }
    
    /**
     * Smooth update loop that applies tilt to all gallery cards
     */
    startUpdateLoop() {
        const update = () => {
            if (!this.isActive) return;
            
            // Smooth the tilt values to reduce jitter
            this.smoothedTilt.x += (this.currentTilt.x - this.smoothedTilt.x) * this.smoothingFactor;
            this.smoothedTilt.y += (this.currentTilt.y - this.smoothedTilt.y) * this.smoothingFactor;
            
            // Apply tilt to all cards
            this.applyTiltToCards();
            
            requestAnimationFrame(update);
        };
        
        update();
        console.log('🎴 Gallery tilt update loop started');
    }
    
    /**
     * Apply calculated tilt to all gallery cards
     */
    applyTiltToCards() {
        // Check if we need to update card list
        const currentCardCount = document.querySelectorAll('.variation-card').length;
        if (currentCardCount !== this.cards.length) {
            this.updateCardList();
        }
        
        this.cards.forEach(card => {
            if (!card) return;
            
            // Calculate smooth tilt values for CSS
            const tiltX = this.smoothedTilt.x * this.sensitivity;
            const tiltY = this.smoothedTilt.y * this.sensitivity;
            
            // Apply to CSS variables with smooth clamping
            const clampedX = Math.max(-1, Math.min(1, tiltX));
            const clampedY = Math.max(-1, Math.min(1, tiltY));
            
            card.style.setProperty('--accel-x', clampedX);
            card.style.setProperty('--accel-y', clampedY);
        });
    }
    
    /**
     * Reset all cards to neutral position
     */
    resetCardsToNeutral() {
        this.cards.forEach(card => {
            if (!card) return;
            
            card.style.setProperty('--accel-x', '0');
            card.style.setProperty('--accel-y', '0');
        });
        
        console.log('🎴 Reset all cards to neutral position');
    }
    
    /**
     * Update sensitivity for fine-tuning
     */
    setSensitivity(newSensitivity) {
        this.sensitivity = Math.max(0.1, Math.min(2.0, newSensitivity));
        console.log(`🎴 Updated tilt sensitivity to: ${this.sensitivity}`);
    }
    
    /**
     * Get current tilt information for debugging
     */
    getTiltInfo() {
        return {
            isActive: this.isActive,
            currentTilt: this.currentTilt,
            smoothedTilt: this.smoothedTilt,
            sensitivity: this.sensitivity,
            cardCount: this.cards.length
        };
    }
}