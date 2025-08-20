/**
 * VIB34D Interaction Handler
 * Manages mouse, touch, and keyboard interactions
 */

export class InteractionHandler {
    constructor(engine) {
        this.engine = engine;
        this.isMouseDown = false;
        this.lastTouchTime = 0;
        this.setupKeyboardShortcuts();
    }
    
    /**
     * Set up mouse tracking for all canvas elements
     */
    setupMouseTracking() {
        const canvases = document.querySelectorAll('canvas');
        
        canvases.forEach(canvas => {
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const intensity = this.isMouseDown ? 1.0 : 0.5;
                this.engine.updateMouseState(x, y, intensity);
            });
            
            canvas.addEventListener('mouseenter', () => {
                this.engine.updateMouseState(0.5, 0.5, 0.3);
            });
            
            canvas.addEventListener('mouseleave', () => {
                this.engine.updateMouseState(0.5, 0.5, 0.0);
            });
        });
    }
    
    /**
     * Set up click handling for interactive effects
     */
    setupClickHandling() {
        const canvases = document.querySelectorAll('canvas');
        
        canvases.forEach(canvas => {
            canvas.addEventListener('mousedown', (e) => {
                this.isMouseDown = true;
                this.engine.triggerClick(1.0);
                e.preventDefault();
            });
            
            canvas.addEventListener('mouseup', () => {
                this.isMouseDown = false;
            });
            
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                // Trigger more intense click at specific position
                this.engine.updateMouseState(x, y, 1.5);
                this.engine.triggerClick(1.2);
            });
        });
        
        // Global mouse up to handle mouse leaving canvas while down
        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
    }
    
    /**
     * Set up touch support for mobile devices
     */
    setupTouchSupport() {
        const canvases = document.querySelectorAll('canvas');
        
        canvases.forEach(canvas => {
            canvas.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / rect.width;
                const y = (touch.clientY - rect.top) / rect.height;
                
                this.engine.updateMouseState(x, y, 1.0);
                this.engine.triggerClick(1.0);
                
                e.preventDefault();
            });
            
            canvas.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / rect.width;
                const y = (touch.clientY - rect.top) / rect.height;
                
                this.engine.updateMouseState(x, y, 0.8);
                e.preventDefault();
            });
            
            canvas.addEventListener('touchend', () => {
                this.engine.updateMouseState(0.5, 0.5, 0.0);
            });
            
            // Handle double-tap
            canvas.addEventListener('touchend', (e) => {
                const currentTime = Date.now();
                if (currentTime - this.lastTouchTime < 300) {
                    // Double tap - randomize variation
                    this.engine.randomVariation();
                }
                this.lastTouchTime = currentTime;
            });
        });
    }
    
    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.engine.previousVariation();
                    e.preventDefault();
                    break;
                    
                case 'ArrowRight':
                    this.engine.nextVariation();
                    e.preventDefault();
                    break;
                    
                case ' ': // Spacebar
                    this.engine.randomVariation();
                    e.preventDefault();
                    break;
                    
                case 'r':
                case 'R':
                    if (e.ctrlKey || e.metaKey) {
                        this.engine.resetToDefaults();
                        e.preventDefault();
                    } else {
                        this.engine.randomizeAll();
                        e.preventDefault();
                    }
                    break;
                    
                case 's':
                case 'S':
                    if (e.ctrlKey || e.metaKey) {
                        this.engine.saveAsCustomVariation();
                        e.preventDefault();
                    }
                    break;
                    
                case 'g':
                case 'G':
                    this.engine.openGalleryView();
                    e.preventDefault();
                    break;
                    
                case 'e':
                case 'E':
                    if (e.ctrlKey || e.metaKey) {
                        this.engine.exportJSON();
                        e.preventDefault();
                    }
                    break;
                    
                case 'Escape':
                    // Close any open modals
                    const modals = document.querySelectorAll('.modal.active');
                    modals.forEach(modal => modal.classList.remove('active'));
                    e.preventDefault();
                    break;
                    
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                    // Quick geometry selection
                    const geometryIndex = parseInt(e.key) - 1;
                    if (geometryIndex >= 0 && geometryIndex < 8) {
                        this.engine.parameterManager.setGeometry(geometryIndex);
                        this.engine.updateDisplayValues();
                        this.engine.updateVisualizers();
                    }
                    e.preventDefault();
                    break;
            }
        });
    }
    
    /**
     * Add haptic feedback for supported devices
     */
    triggerHapticFeedback(type = 'light') {
        if (navigator.vibrate) {
            switch (type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate(50);
                    break;
            }
        }
    }
    
    /**
     * Get interaction statistics
     */
    getInteractionStats() {
        return {
            mouseSupport: 'onmousemove' in window,
            touchSupport: 'ontouchstart' in window,
            pointerSupport: 'onpointerdown' in window,
            hapticSupport: 'vibrate' in navigator
        };
    }
}