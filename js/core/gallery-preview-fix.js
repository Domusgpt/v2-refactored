/**
 * GALLERY PREVIEW SYSTEM INITIALIZATION FIX
 * Ensures gallery previews work properly even when some systems fail to load
 */

export class GalleryPreviewFix {
    constructor() {
        this.initializationAttempts = 0;
        this.maxAttempts = 5;
        this.retryDelay = 500;
    }

    /**
     * Initialize gallery preview with proper system checking
     */
    async initializeGalleryPreview() {
        // Check if this is a gallery preview
        if (!window.isGalleryPreview || !window.galleryPreviewData) {
            return;
        }

        console.log('🎨 GALLERY PREVIEW FIX: Initializing for', window.galleryPreviewData.system);
        
        // Wait for engine classes to be available
        await this.waitForEngineClasses();
        
        // Check if target system is available
        const targetSystem = window.galleryPreviewData.system;
        const isSystemAvailable = this.checkSystemAvailability(targetSystem);
        
        if (!isSystemAvailable) {
            console.warn(`🎨 GALLERY PREVIEW FIX: ${targetSystem} system not available, falling back to faceted`);
            window.galleryPreviewData.system = 'faceted';
            window.currentSystem = 'faceted';
        }
        
        // Apply gallery preview with proper system
        await this.applyGalleryPreview();
    }

    /**
     * Wait for engine classes to be loaded
     */
    async waitForEngineClasses() {
        return new Promise((resolve) => {
            const checkEngineClasses = () => {
                if (window.engineClasses && Object.keys(window.engineClasses).length > 0) {
                    console.log('🎨 GALLERY PREVIEW FIX: Engine classes available');
                    resolve();
                } else if (this.initializationAttempts < this.maxAttempts) {
                    this.initializationAttempts++;
                    console.log(`🎨 GALLERY PREVIEW FIX: Waiting for engine classes... (${this.initializationAttempts}/${this.maxAttempts})`);
                    setTimeout(checkEngineClasses, this.retryDelay);
                } else {
                    console.warn('🎨 GALLERY PREVIEW FIX: Timeout waiting for engine classes, proceeding anyway');
                    resolve();
                }
            };
            
            checkEngineClasses();
        });
    }

    /**
     * Check if a system is actually available
     */
    checkSystemAvailability(systemName) {
        if (!window.engineClasses) {
            console.warn('🎨 GALLERY PREVIEW FIX: No engine classes available');
            return false;
        }

        const engineMap = {
            'faceted': 'VIB34DIntegratedEngine',
            'quantum': 'QuantumEngine', 
            'holographic': 'RealHolographicSystem',
            'polychora': 'PolychoraSystem'
        };

        const requiredEngine = engineMap[systemName];
        const isAvailable = requiredEngine && window.engineClasses[requiredEngine];
        
        console.log(`🎨 GALLERY PREVIEW FIX: System ${systemName} availability:`, {
            requiredEngine,
            available: !!isAvailable,
            engineClasses: Object.keys(window.engineClasses || {}).filter(k => window.engineClasses[k])
        });

        return !!isAvailable;
    }

    /**
     * Apply gallery preview with proper error handling
     */
    async applyGalleryPreview() {
        const { system, parameters } = window.galleryPreviewData;
        
        console.log(`🎨 GALLERY PREVIEW FIX: Applying preview for ${system} system`);
        
        try {
            // Switch to the target system
            if (window.switchSystem && system !== 'faceted') {
                console.log(`🎨 GALLERY PREVIEW FIX: Switching to ${system}`);
                await window.switchSystem(system);
            }
            
            // Apply parameters after a delay to ensure system is ready
            setTimeout(() => {
                this.applyGalleryParameters(parameters);
            }, 800);
            
        } catch (error) {
            console.error('🎨 GALLERY PREVIEW FIX: Error applying preview:', error);
            
            // Fallback to faceted system
            if (system !== 'faceted') {
                console.log('🎨 GALLERY PREVIEW FIX: Falling back to faceted system');
                window.currentSystem = 'faceted';
                setTimeout(() => {
                    this.applyGalleryParameters(parameters);
                }, 500);
            }
        }
    }

    /**
     * Apply gallery parameters with reduced spam
     */
    applyGalleryParameters(parameters) {
        console.log('🎨 GALLERY PREVIEW FIX: Applying parameters:', parameters);
        
        // Throttle parameter updates to reduce spam
        const parameterEntries = Object.entries(parameters);
        let index = 0;
        
        const applyNextParameter = () => {
            if (index >= parameterEntries.length) {
                console.log('🎨 GALLERY PREVIEW FIX: All parameters applied');
                return;
            }
            
            const [param, value] = parameterEntries[index];
            
            try {
                if (window.updateParameter) {
                    window.updateParameter(param, value);
                } else {
                    console.warn('🎨 GALLERY PREVIEW FIX: updateParameter not available');
                }
            } catch (error) {
                console.warn(`🎨 GALLERY PREVIEW FIX: Error setting ${param}:`, error.message);
            }
            
            index++;
            
            // Apply next parameter with small delay to reduce spam
            setTimeout(applyNextParameter, 50);
        };
        
        applyNextParameter();
    }

    /**
     * Suppress repetitive warning messages
     */
    suppressWarningSpam() {
        if (!window.originalConsoleWarn) {
            window.originalConsoleWarn = console.warn;
            
            const warningCounts = new Map();
            const maxWarnings = 3;
            
            console.warn = function(...args) {
                const message = args.join(' ');
                
                // Check if this is a repetitive system availability warning
                if (message.includes('System') && message.includes('not available')) {
                    const count = warningCounts.get(message) || 0;
                    
                    if (count < maxWarnings) {
                        warningCounts.set(message, count + 1);
                        window.originalConsoleWarn.apply(console, args);
                        
                        if (count === maxWarnings - 1) {
                            window.originalConsoleWarn('🔇 Suppressing further identical warnings for this session');
                        }
                    }
                } else {
                    // Allow non-repetitive warnings through
                    window.originalConsoleWarn.apply(console, args);
                }
            };
            
            console.log('🔇 Gallery preview warning spam suppression active');
        }
    }
}

// Initialize gallery preview fix if this is a gallery preview
if (typeof window !== 'undefined' && window.location.search.includes('system=')) {
    console.log('🎨 GALLERY PREVIEW FIX: Detected gallery preview mode');
    
    const galleryPreviewFix = new GalleryPreviewFix();
    
    // Suppress warning spam immediately
    galleryPreviewFix.suppressWarningSpam();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => galleryPreviewFix.initializeGalleryPreview(), 1000);
        });
    } else {
        setTimeout(() => galleryPreviewFix.initializeGalleryPreview(), 1000);
    }
    
    window.galleryPreviewFix = galleryPreviewFix;
}

console.log('🎨 Gallery Preview Fix: Loaded');