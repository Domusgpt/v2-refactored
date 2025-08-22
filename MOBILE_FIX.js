/**
 * MOBILE WEBGL FIX - Comprehensive solution for black screen issues
 * Apply this before any system initialization
 */

window.MobileWebGLFix = {
    // Mobile detection
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    
    // WebGL context pool to prevent exhaustion
    contextPool: new Map(),
    activeContexts: 0,
    maxContexts: 8, // Conservative limit for mobile
    
    // Mobile-specific settings
    mobileSettings: {
        antialias: false,           // Disable antialiasing on mobile
        preserveDrawingBuffer: false, // Don't preserve buffer
        powerPreference: 'default',  // Use default power preference
        failIfMajorPerformanceCaveat: false, // Don't fail on performance issues
        precision: 'mediump'         // Use medium precision on mobile
    },
    
    /**
     * Create mobile-optimized WebGL context
     */
    createMobileWebGLContext(canvas, options = {}) {
        if (!this.isMobile) {
            // On desktop, use normal context creation
            return canvas.getContext('webgl2', options) || 
                   canvas.getContext('webgl', options) ||
                   canvas.getContext('experimental-webgl', options);
        }
        
        // Check context limit
        if (this.activeContexts >= this.maxContexts) {
            console.warn(`⚠️ Mobile WebGL context limit reached (${this.maxContexts})`);
            return this.reuseExistingContext(canvas);
        }
        
        // Mobile-optimized context options
        const mobileOptions = {
            ...this.mobileSettings,
            ...options
        };
        
        console.log(`📱 Creating mobile WebGL context for ${canvas.id} (${this.activeContexts + 1}/${this.maxContexts})`);
        
        // Try WebGL context creation with mobile settings
        let gl = null;
        
        // Try WebGL 1 first on mobile (better compatibility)
        gl = canvas.getContext('webgl', mobileOptions) || 
             canvas.getContext('experimental-webgl', mobileOptions);
        
        if (!gl) {
            // Fallback to WebGL 2 if needed
            gl = canvas.getContext('webgl2', mobileOptions);
        }
        
        if (gl) {
            this.activeContexts++;
            this.contextPool.set(canvas.id, gl);
            
            // Add context lost handler
            canvas.addEventListener('webglcontextlost', (e) => {
                console.warn(`📱 WebGL context lost for ${canvas.id}`);
                e.preventDefault();
                this.activeContexts = Math.max(0, this.activeContexts - 1);
            });
            
            // Add context restored handler  
            canvas.addEventListener('webglcontextrestored', (e) => {
                console.log(`📱 WebGL context restored for ${canvas.id}`);
                this.activeContexts++;
            });
            
            console.log(`✅ Mobile WebGL context created for ${canvas.id}`);
        } else {
            console.error(`❌ Failed to create WebGL context for ${canvas.id}`);
        }
        
        return gl;
    },
    
    /**
     * Reuse existing context when limit is reached
     */
    reuseExistingContext(canvas) {
        // Find the oldest context to reuse
        const contexts = Array.from(this.contextPool.entries());
        if (contexts.length > 0) {
            const [oldCanvasId, existingGL] = contexts[0];
            console.log(`📱 Reusing WebGL context from ${oldCanvasId} for ${canvas.id}`);
            
            this.contextPool.delete(oldCanvasId);
            this.contextPool.set(canvas.id, existingGL);
            
            return existingGL;
        }
        
        return null;
    },
    
    /**
     * Fix canvas dimensions before WebGL context creation
     */
    fixCanvasDimensions(canvas) {
        if (!canvas) return false;
        
        // Get parent container
        const parent = canvas.parentElement;
        if (!parent) return false;
        
        // Temporarily make parent visible for measurement
        const originalDisplay = parent.style.display;
        if (originalDisplay === 'none') {
            parent.style.display = 'block';
        }
        
        // Get computed dimensions
        const rect = parent.getBoundingClientRect();
        
        // Restore original display
        if (originalDisplay === 'none') {
            parent.style.display = originalDisplay;
        }
        
        // Set canvas dimensions with mobile-safe values
        const width = rect.width > 0 ? rect.width : window.innerWidth - 40;
        const height = rect.height > 0 ? rect.height : window.innerHeight - 100;
        
        // Use lower DPI on mobile to save memory
        const dpr = this.isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : (window.devicePixelRatio || 1);
        
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        console.log(`📱 Canvas ${canvas.id} sized: ${canvas.width}x${canvas.height} (DPR: ${dpr.toFixed(1)})`);
        
        return true;
    },
    
    /**
     * Apply mobile shader precision fix
     */
    fixShaderPrecision(shaderSource) {
        if (!this.isMobile) return shaderSource;
        
        // Replace highp with mediump on mobile
        return shaderSource
            .replace(/precision\s+highp\s+float/g, 'precision mediump float')
            .replace(/precision\s+highp\s+int/g, 'precision mediump int');
    },
    
    /**
     * Initialize mobile fixes for all canvases
     */
    initializeMobileFixes() {
        if (!this.isMobile) {
            console.log('💻 Desktop detected - mobile fixes not needed');
            return;
        }
        
        console.log('📱 Mobile detected - applying WebGL fixes');
        
        // Find all visualization canvases
        const canvases = document.querySelectorAll('.visualization-canvas, canvas[id*="canvas"]');
        
        canvases.forEach(canvas => {
            this.fixCanvasDimensions(canvas);
        });
        
        // Override canvas.getContext globally for mobile
        const originalGetContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(contextType, options) {
            if (contextType.includes('webgl')) {
                return window.MobileWebGLFix.createMobileWebGLContext(this, options);
            }
            return originalGetContext.call(this, contextType, options);
        };
        
        // Add resize handler
        window.addEventListener('resize', () => {
            setTimeout(() => {
                canvases.forEach(canvas => {
                    window.MobileWebGLFix.fixCanvasDimensions(canvas);
                });
            }, 100);
        });
        
        // Add memory pressure handlers
        if ('onmemorywarning' in window) {
            window.addEventListener('memorywarning', () => {
                console.warn('📱 Memory warning - clearing WebGL contexts');
                this.clearUnusedContexts();
            });
        }
        
        console.log(`📱 Mobile fixes applied to ${canvases.length} canvases`);
    },
    
    /**
     * Clear unused WebGL contexts to free memory
     */
    clearUnusedContexts() {
        this.contextPool.forEach((gl, canvasId) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas || canvas.style.display === 'none') {
                if (gl && !gl.isContextLost()) {
                    // Force context loss to free resources
                    const loseContext = gl.getExtension('WEBGL_lose_context');
                    if (loseContext) {
                        loseContext.loseContext();
                    }
                }
                this.contextPool.delete(canvasId);
                this.activeContexts = Math.max(0, this.activeContexts - 1);
                console.log(`📱 Cleared unused WebGL context for ${canvasId}`);
            }
        });
    },
    
    /**
     * Get mobile-safe WebGL context with error handling
     */
    getSafeWebGLContext(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`❌ Canvas ${canvasId} not found`);
            return null;
        }
        
        // Fix dimensions first
        this.fixCanvasDimensions(canvas);
        
        // Wait a frame for layout
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                const gl = this.createMobileWebGLContext(canvas);
                if (gl) {
                    console.log(`✅ Safe WebGL context created for ${canvasId}`);
                } else {
                    console.error(`❌ Failed to create safe WebGL context for ${canvasId}`);
                }
                resolve(gl);
            });
        });
    }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.MobileWebGLFix.initializeMobileFixes();
    });
} else {
    window.MobileWebGLFix.initializeMobileFixes();
}

console.log('📱 Mobile WebGL fix loaded');