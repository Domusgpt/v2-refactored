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
        
        // Try to initialize target system (more aggressive approach)
        const targetSystem = window.galleryPreviewData.system;
        let systemReady = false;
        
        console.log(`🎨 GALLERY PREVIEW FIX: Attempting to initialize ${targetSystem} system`);
        
        // First, try to switch to the target system
        if (window.switchSystem && targetSystem !== 'faceted') {
            try {
                console.log(`🎨 Attempting to switch to ${targetSystem} system...`);
                await window.switchSystem(targetSystem);
                
                // Wait a moment for system to initialize
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Check if system is now available
                const isSystemAvailable = this.checkSystemAvailability(targetSystem);
                if (isSystemAvailable) {
                    console.log(`✅ Successfully initialized ${targetSystem} system`);
                    systemReady = true;
                } else {
                    console.warn(`⚠️ ${targetSystem} system switch completed but not fully available`);
                }
            } catch (e) {
                console.warn(`❌ Failed to switch to ${targetSystem}: ${e.message}`);
            }
        } else if (targetSystem === 'faceted') {
            // Faceted system should always be available
            systemReady = true;
        }
        
        // Only fall back to faceted if target system completely failed
        if (!systemReady && targetSystem !== 'faceted') {
            console.warn(`🎨 GALLERY PREVIEW FIX: ${targetSystem} system failed to initialize, falling back to faceted`);
            window.galleryPreviewData.system = 'faceted';
            window.currentSystem = 'faceted';
            
            if (window.switchSystem) {
                try {
                    await window.switchSystem('faceted');
                    console.log('✅ Successfully switched to faceted as fallback');
                } catch (e) {
                    console.warn('❌ Fallback switch to faceted failed:', e.message);
                }
            }
        }
        
        // Apply gallery preview with proper system
        await this.applyGalleryPreview();
    }

    /**
     * Wait for engine classes to be loaded AND for target system to be available
     */
    async waitForEngineClasses() {
        return new Promise((resolve) => {
            const checkEngineClasses = () => {
                const hasEngineClasses = window.engineClasses && Object.keys(window.engineClasses).length > 0;
                const hasTargetSystemEngine = this.checkTargetSystemEngine(window.galleryPreviewData?.system);
                
                if (hasEngineClasses && hasTargetSystemEngine) {
                    console.log('🎨 GALLERY PREVIEW FIX: Engine classes AND target system available');
                    resolve();
                } else if (this.initializationAttempts < this.maxAttempts) {
                    this.initializationAttempts++;
                    console.log(`🎨 GALLERY PREVIEW FIX: Waiting for engines... (${this.initializationAttempts}/${this.maxAttempts})`);
                    console.log(`  - Engine classes: ${hasEngineClasses ? '✅' : '❌'}`);
                    console.log(`  - Target system (${window.galleryPreviewData?.system}): ${hasTargetSystemEngine ? '✅' : '❌'}`);
                    setTimeout(checkEngineClasses, this.retryDelay);
                } else {
                    console.warn('🎨 GALLERY PREVIEW FIX: Timeout waiting for engines - will attempt to continue');
                    console.log(`🎨 Final status: Engine classes: ${hasEngineClasses}, Target system: ${hasTargetSystemEngine}`);
                    resolve();
                }
            };
            
            checkEngineClasses();
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
     * Apply gallery preview with proper error handling
     */
    async applyGalleryPreview() {
        const { system, parameters } = window.galleryPreviewData;
        
        console.log(`🎨 GALLERY PREVIEW FIX: Applying preview for ${system} system`);
        console.log(`🎨 Gallery preview parameters:`, parameters);
        
        try {
            // ENHANCED: Always try to switch, even for faceted system (to ensure proper initialization)
            if (window.switchSystem) {
                console.log(`🎨 GALLERY PREVIEW FIX: Attempting to switch to ${system}`);
                try {
                    await window.switchSystem(system);
                    console.log(`✅ Successfully switched to ${system}`);
                } catch (switchError) {
                    console.error(`❌ Switch to ${system} failed:`, switchError);
                    
                    // Try fallback system if not already faceted
                    if (system !== 'faceted') {
                        console.log('🎨 Trying faceted system as fallback...');
                        try {
                            await window.switchSystem('faceted');
                            window.currentSystem = 'faceted';
                            console.log('✅ Fallback to faceted successful');
                        } catch (fallbackError) {
                            console.error('❌ Even faceted fallback failed:', fallbackError);
                        }
                    }
                }
            } else {
                console.warn('🎨 switchSystem not available - using direct currentSystem assignment');
                window.currentSystem = system;
            }
            
            // Apply parameters with multiple timing attempts
            const applyWithRetries = (attempt = 1) => {
                console.log(`🎨 Parameter application attempt ${attempt}/3`);
                this.applyGalleryParameters(parameters);
                
                // Retry if needed
                if (attempt < 3) {
                    setTimeout(() => applyWithRetries(attempt + 1), 1000);
                }
            };
            
            // Start applying parameters after system switch
            setTimeout(() => applyWithRetries(), 600);
            
        } catch (error) {
            console.error('🎨 GALLERY PREVIEW FIX: Critical error in applyGalleryPreview:', error);
            
            // Emergency fallback - apply parameters anyway
            console.log('🎨 Emergency fallback - applying parameters with current system');
            setTimeout(() => {
                this.applyGalleryParameters(parameters);
            }, 500);
        }
    }

    /**
     * Apply gallery parameters with reduced spam
     */
    applyGalleryParameters(parameters) {
        console.log('🎨 GALLERY PREVIEW FIX: Applying parameters:', parameters);
        
        // ENHANCED: Multiple application methods for maximum compatibility
        
        // Method 1: Update global userParameterState immediately
        if (window.userParameterState) {
            Object.assign(window.userParameterState, parameters);
            console.log('🎨 Updated global userParameterState with gallery parameters');
        }
        
        // Method 2: Update sliders directly for immediate visual feedback
        Object.entries(parameters).forEach(([param, value]) => {
            const slider = document.getElementById(param);
            if (slider) {
                slider.value = value;
                
                // Update display value if it exists
                const display = slider.parentElement?.querySelector('.control-value');
                if (display) {
                    display.textContent = value;
                }
                
                console.log(`🎨 Updated slider ${param} = ${value}`);
            }
        });
        
        // Method 3: Apply via updateParameter function with delay for engine initialization
        setTimeout(() => {
            const parameterEntries = Object.entries(parameters);
            let index = 0;
            
            const applyNextParameter = () => {
                if (index >= parameterEntries.length) {
                    console.log('🎨 GALLERY PREVIEW FIX: All parameters applied via updateParameter');
                    
                    // Method 4: Force sync visualizer to UI as final step
                    setTimeout(() => {
                        if (window.syncVisualizerToUI && window.currentSystem) {
                            const currentEngine = this.getCurrentEngine();
                            if (currentEngine) {
                                window.syncVisualizerToUI(window.currentSystem, currentEngine);
                                console.log('🎨 Final sync: syncVisualizerToUI called');
                            }
                        }
                    }, 200);
                    
                    return;
                }
                
                const [param, value] = parameterEntries[index];
                
                try {
                    if (window.updateParameter) {
                        window.updateParameter(param, value);
                    }
                } catch (error) {
                    console.warn(`🎨 GALLERY PREVIEW FIX: Error setting ${param}:`, error.message);
                }
                
                index++;
                setTimeout(applyNextParameter, 50);
            };
            
            applyNextParameter();
        }, 1000); // Wait 1 second for engines to be ready
    }
    
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