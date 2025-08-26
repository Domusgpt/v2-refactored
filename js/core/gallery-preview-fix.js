/**
 * GALLERY PREVIEW SYSTEM INITIALIZATION FIX
 * Ensures gallery previews work properly even when some systems fail to load
 */

export class GalleryPreviewFix {
    constructor() {
        this.initializationAttempts = 0;
        this.maxAttempts = 10; // Increased from 5 to 10
        this.retryDelay = 1000; // Increased from 500ms to 1000ms
    }

    /**
     * Initialize gallery preview - FAST & SIMPLE approach that works WITH CanvasManager
     */
    async initializeGalleryPreview() {
        // Check if this is a gallery preview
        if (!window.isGalleryPreview || !window.galleryPreviewData) {
            return;
        }

        console.log('🚀 FAST GALLERY PREVIEW: Initializing for', window.galleryPreviewData.system);
        
        // Wait for critical systems to be ready
        await this.waitForCriticalSystems();
        
        // SINGLE system switch - let CanvasManager handle the canvas lifecycle
        const targetSystem = window.galleryPreviewData.system;
        console.log(`🚀 FAST GALLERY PREVIEW: Switching to ${targetSystem} (ONCE)`);
        
        try {
            // Single switch call - CanvasManager will handle everything
            await window.switchSystem(targetSystem);
            console.log(`✅ FAST: ${targetSystem} system ready`);
        } catch (e) {
            console.warn(`❌ FAST: Switch to ${targetSystem} failed, using fallback:`, e.message);
            // Only try fallback if the target system failed
            if (targetSystem !== 'faceted') {
                try {
                    await window.switchSystem('faceted');
                    window.galleryPreviewData.system = 'faceted';
                    console.log('✅ FAST: Fallback to faceted successful');
                } catch (fallbackError) {
                    console.error('❌ FAST: Even fallback failed:', fallbackError.message);
                }
            }
        }
        
        // Apply parameters ONCE after system is ready
        await this.applyParametersFast();
    }

    /**
     * Wait for critical systems - FASTER version
     */
    async waitForCriticalSystems() {
        return new Promise((resolve) => {
            const checkCriticalSystems = () => {
                // Only check for the essentials needed for switchSystem to work
                const hasSwitchSystem = typeof window.switchSystem === 'function';
                const hasCanvasManager = !!window.canvasManager;
                const hasEngineClasses = window.engineClasses && Object.keys(window.engineClasses).length > 0;
                
                const essentialsReady = hasSwitchSystem && hasCanvasManager && hasEngineClasses;
                
                if (essentialsReady) {
                    console.log('🚀 FAST GALLERY PREVIEW: Essential systems ready!');
                    resolve();
                } else if (this.initializationAttempts < 5) { // Reduced max attempts
                    this.initializationAttempts++;
                    console.log(`🚀 FAST: Waiting for essentials... (${this.initializationAttempts}/5)`);
                    console.log(`  - switchSystem: ${hasSwitchSystem ? '✅' : '❌'}`);
                    console.log(`  - canvasManager: ${hasCanvasManager ? '✅' : '❌'}`);
                    console.log(`  - engineClasses: ${hasEngineClasses ? '✅' : '❌'}`);
                    setTimeout(checkCriticalSystems, 500); // Reduced delay
                } else {
                    console.warn('🚀 FAST: Timeout waiting for essentials - proceeding anyway');
                    resolve();
                }
            };
            
            checkCriticalSystems();
        });
    }
    
    /**
     * Check if target system engine is loaded (more lenient check)
     */
    checkTargetSystemEngine(systemName) {
        if (!systemName) return false;
        
        const engineInstances = {
            'faceted': window.engine,
            'quantum': window.quantumEngine,
            'holographic': window.holographicSystem,
            'polychora': window.polychoraSystem
        };
        
        const hasInstance = !!engineInstances[systemName];
        
        // Also check if switchSystem function exists (fallback method)
        const hasSwitchFunction = typeof window.switchSystem === 'function';
        
        // Return true if either the engine exists OR switchSystem is available (it can create engines)
        return hasInstance || hasSwitchFunction;
    }

    /**
     * Check if a system is actually available
     */
    checkSystemAvailability(systemName) {
        console.log(`🎨 GALLERY PREVIEW FIX: Checking ${systemName} system availability...`);
        
        // CRITICAL FIX: Always force switch to faceted for gallery previews if the target system isn't available
        // This prevents infinite parameter loops in gallery previews
        
        // Method 1: Check for actual engine instances (most reliable)
        const engineInstances = {
            'faceted': window.engine,
            'quantum': window.quantumEngine,
            'holographic': window.holographicSystem,
            'polychora': window.polychoraSystem
        };
        
        const hasInstance = !!engineInstances[systemName];
        if (hasInstance) {
            console.log(`✅ ${systemName} available via engine instance`);
            return true;
        }
        
        // Method 2: Check for switchSystem function capability (but only for proven working systems)
        if (window.switchSystem && systemName === 'faceted') {
            // Faceted is always the fallback system and should always work
            console.log(`✅ ${systemName} available via switchSystem (fallback)`);
            return true;
        }
        
        // Method 3: For gallery previews, if the target system isn't available, fall back to faceted
        if (window.isGalleryPreview && systemName !== 'faceted') {
            console.warn(`⚠️ Gallery preview: ${systemName} not available, will fallback to faceted`);
            return false; // This will trigger the fallback logic
        }
        
        console.warn(`❌ ${systemName} system not available`, {
            engineInstance: hasInstance,
            switchSystemExists: !!window.switchSystem,
            isGalleryPreview: window.isGalleryPreview,
            availableInstances: Object.keys(engineInstances).filter(k => engineInstances[k])
        });

        return false;
    }

    /**
     * Apply parameters FAST - single application, let CanvasManager/switchSystem handle the rest
     */
    async applyParametersFast() {
        const { parameters } = window.galleryPreviewData;
        
        console.log(`🚀 FAST GALLERY PREVIEW: Applying parameters ONCE`);
        console.log(`🚀 Parameters:`, parameters);
        
        // Wait a moment for CanvasManager to finish canvas creation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            // SINGLE parameter application - trust that switchSystem already set up the engine correctly
            if (window.userParameterState) {
                Object.assign(window.userParameterState, parameters);
            }
            
            // Apply each parameter once via updateParameter (this routes to the correct engine)
            Object.entries(parameters).forEach(([param, value]) => {
                try {
                    if (window.updateParameter) {
                        window.updateParameter(param, value);
                        console.log(`🚀 FAST: ${param} = ${value}`);
                    }
                } catch (error) {
                    console.warn(`🚀 FAST: Parameter ${param} failed:`, error.message);
                }
            });
            
            console.log('🚀 FAST GALLERY PREVIEW: Parameter application complete');
            
        } catch (error) {
            console.error('🚀 FAST: Parameter application error:', error);
        }
    }

    /**
     * Get current engine - simple helper
     */
    
    getCurrentEngine() {
        const system = window.currentSystem;
        switch (system) {
            case 'faceted': return window.engine;
            case 'quantum': return window.quantumEngine;
            case 'holographic': return window.holographicSystem;
            default: return null;
        }
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
    
    // Initialize FAST for gallery previews - minimal delay
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => galleryPreviewFix.initializeGalleryPreview(), 50);
        });
    } else {
        setTimeout(() => galleryPreviewFix.initializeGalleryPreview(), 50);
    }
    
    window.galleryPreviewFix = galleryPreviewFix;
}

console.log('🎨 Gallery Preview Fix: Loaded');