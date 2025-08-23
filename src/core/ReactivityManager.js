/**
 * VIB34D Modular Reactivity Manager
 * Handles 3 categories of reactivity that can work on any system
 */

export class ReactivityManager {
    constructor() {
        console.log('⚡ Initializing Modular Reactivity Manager');
        
        // Global reactivity state
        this.enabled = true; // Master toggle (controlled by existing global toggle)
        
        // Individual category toggles
        this.mouseEnabled = true;
        this.clickEnabled = true;
        this.scrollEnabled = true;
        
        // Current active system (receives parameter updates)
        this.activeSystem = null;
        this.activeSystemName = 'faceted';
        
        // Available modes for each category
        this.mouseModes = {
            'rotations': new RotationMode(),     // Faceted style
            'velocity': new VelocityMode(),      // Quantum style  
            'distance': new DistanceMode()       // Holographic style
        };
        
        this.clickModes = {
            'burst': new BurstMode(),            // Faceted style
            'blast': new BlastMode(),            // Quantum style
            'ripple': new RippleMode()           // Holographic style
        };
        
        this.scrollModes = {
            'cycle': new CycleMode(),            // Faceted style
            'wave': new WaveMode(),              // Quantum style
            'sweep': new SweepMode()             // New mode
        };
        
        // Current selected modes (default to system-appropriate)
        this.currentMouseMode = 'rotations';   // Start with Faceted default
        this.currentClickMode = 'burst';       // Start with Faceted default  
        this.currentScrollMode = 'cycle';      // Start with Faceted default
        
        this.setupGlobalListeners();
    }
    
    /**
     * Set the active system that will receive parameter updates
     */
    setActiveSystem(systemName, systemInstance) {
        console.log(`⚡ Reactivity switching to: ${systemName}`);
        this.activeSystemName = systemName;
        this.activeSystem = systemInstance;
        
        // Auto-switch to system-appropriate defaults (but user can override)
        this.autoSelectDefaults(systemName);
    }
    
    /**
     * Auto-select appropriate modes for each system (but user can override)
     */
    autoSelectDefaults(systemName) {
        const defaults = {
            'faceted': { mouse: 'rotations', click: 'burst', scroll: 'cycle' },
            'quantum': { mouse: 'velocity', click: 'blast', scroll: 'wave' },
            'holographic': { mouse: 'distance', click: 'ripple', scroll: 'sweep' },
            'polychora': { mouse: 'rotations', click: 'burst', scroll: 'cycle' }
        };
        
        if (defaults[systemName]) {
            this.currentMouseMode = defaults[systemName].mouse;
            this.currentClickMode = defaults[systemName].click;
            this.currentScrollMode = defaults[systemName].scroll;
            
            console.log(`⚡ Auto-selected modes for ${systemName}: ${this.currentMouseMode}, ${this.currentClickMode}, ${this.currentScrollMode}`);
        }
    }
    
    /**
     * Setup global event listeners that work across all systems
     */
    setupGlobalListeners() {
        console.log('⚡ Setting up global reactivity listeners');
        
        // We'll add event listeners to all potential canvas elements
        const canvasSelectors = [
            // Faceted canvases
            'background-canvas', 'shadow-canvas', 'content-canvas', 'highlight-canvas', 'accent-canvas',
            // Quantum canvases  
            'quantum-background-canvas', 'quantum-shadow-canvas', 'quantum-content-canvas', 'quantum-highlight-canvas', 'quantum-accent-canvas',
            // Holographic canvases
            'holo-background-canvas', 'holo-shadow-canvas', 'holo-content-canvas', 'holo-highlight-canvas', 'holo-accent-canvas',
            // Polychora canvases (for future)
            'polychora-background-canvas', 'polychora-shadow-canvas', 'polychora-content-canvas', 'polychora-highlight-canvas', 'polychora-accent-canvas'
        ];
        
        // Add event listeners using event delegation (more efficient)
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
        document.addEventListener('touchmove', (e) => this.handleGlobalTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleGlobalTouchEnd(e));
        document.addEventListener('wheel', (e) => this.handleGlobalWheel(e));
    }
    
    /**
     * Global mouse move handler
     */
    handleGlobalMouseMove(e) {
        if (!this.enabled || !this.mouseEnabled || !this.isCanvasEvent(e)) return;
        
        const coords = this.getEventCoords(e);
        if (!coords) return;
        
        // Route to current mouse mode
        const mode = this.mouseModes[this.currentMouseMode];
        if (mode && mode.handleMouseMove) {
            mode.handleMouseMove(coords.x, coords.y, this.updateParameter.bind(this));
        }
    }
    
    /**
     * Global click handler
     */
    handleGlobalClick(e) {
        if (!this.enabled || !this.clickEnabled || !this.isCanvasEvent(e)) return;
        
        const coords = this.getEventCoords(e);
        if (!coords) return;
        
        // Route to current click mode
        const mode = this.clickModes[this.currentClickMode];
        if (mode && mode.handleClick) {
            mode.handleClick(coords.x, coords.y, this.updateParameter.bind(this));
        }
    }
    
    /**
     * Global wheel handler  
     */
    handleGlobalWheel(e) {
        if (!this.enabled || !this.scrollEnabled || !this.isCanvasEvent(e)) return;
        
        e.preventDefault();
        
        // Route to current scroll mode
        const mode = this.scrollModes[this.currentScrollMode];
        if (mode && mode.handleWheel) {
            mode.handleWheel(e.deltaY, this.updateParameter.bind(this));
        }
    }
    
    /**
     * Check if event happened on a canvas element
     */
    isCanvasEvent(e) {
        const target = e.target;
        return target.tagName === 'CANVAS' && target.classList.contains('visualization-canvas');
    }
    
    /**
     * Get normalized coordinates from event
     */
    getEventCoords(e) {
        const target = e.target;
        if (!target) return null;
        
        const rect = target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        return { x, y };
    }
    
    /**
     * Handle touch events
     */
    handleGlobalTouchMove(e) {
        if (!this.enabled || !this.mouseEnabled || !this.isCanvasEvent(e)) return;
        
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = e.target.getBoundingClientRect();
            const x = (touch.clientX - rect.left) / rect.width;
            const y = (touch.clientY - rect.top) / rect.height;
            
            const mode = this.mouseModes[this.currentMouseMode];
            if (mode && mode.handleMouseMove) {
                mode.handleMouseMove(x, y, this.updateParameter.bind(this));
            }
        }
    }
    
    handleGlobalTouchEnd(e) {
        if (!this.enabled || !this.clickEnabled || !this.isCanvasEvent(e)) return;
        
        if (e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            const rect = e.target.getBoundingClientRect();
            const x = (touch.clientX - rect.left) / rect.width;
            const y = (touch.clientY - rect.top) / rect.height;
            
            const mode = this.clickModes[this.currentClickMode];
            if (mode && mode.handleClick) {
                mode.handleClick(x, y, this.updateParameter.bind(this));
            }
        }
    }
    
    /**
     * Update parameter on active system (conflict resolution: active system wins)
     */
    updateParameter(param, value) {
        // Active system takes control - simple conflict resolution
        if (window.updateParameter) {
            window.updateParameter(param, value);
        }
        
        console.log(`⚡ ${this.activeSystemName} reactivity: ${param} = ${value}`);
    }
    
    /**
     * Toggle methods for UI
     */
    toggleMouse(enabled) {
        this.mouseEnabled = enabled;
        console.log(`⚡ Mouse reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    toggleClick(enabled) {
        this.clickEnabled = enabled;  
        console.log(`⚡ Click reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    toggleScroll(enabled) {
        this.scrollEnabled = enabled;
        console.log(`⚡ Scroll reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Mode selection methods for UI
     */
    setMouseMode(mode) {
        if (this.mouseModes[mode]) {
            this.currentMouseMode = mode;
            console.log(`⚡ Mouse mode: ${mode}`);
        }
    }
    
    setClickMode(mode) {
        if (this.clickModes[mode]) {
            this.currentClickMode = mode;
            console.log(`⚡ Click mode: ${mode}`);
        }
    }
    
    setScrollMode(mode) {
        if (this.scrollModes[mode]) {
            this.currentScrollMode = mode;
            console.log(`⚡ Scroll mode: ${mode}`);
        }
    }
    
    /**
     * Global enable/disable (controlled by existing master toggle)
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`⚡ Global reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }
}

/**
 * MOUSE MODE CLASSES
 */

class RotationMode {
    constructor() {
        this.lastPosition = { x: 0.5, y: 0.5 };
        this.scrollHue = 200; // Base blue hue
    }
    
    handleMouseMove(x, y, updateParam) {
        // Faceted 4D rotation logic
        const rotationRange = 6.28 * 2;
        const rot4dXW = (x - 0.5) * rotationRange;
        const rot4dYW = (x - 0.5) * rotationRange * 0.7;
        const rot4dZW = (y - 0.5) * rotationRange;
        
        // Subtle hue changes
        const hueOffset = (x - 0.5) * 30;
        const mouseHue = (this.scrollHue + hueOffset) % 360;
        
        updateParam('rot4dXW', rot4dXW.toFixed(2));
        updateParam('rot4dYW', rot4dYW.toFixed(2));
        updateParam('rot4dZW', rot4dZW.toFixed(2));
        updateParam('hue', Math.round(mouseHue));
    }
}

class VelocityMode {
    constructor() {
        this.lastPosition = { x: 0.5, y: 0.5 };
        this.velocityHistory = [];
    }
    
    handleMouseMove(x, y, updateParam) {
        // Quantum velocity tracking logic
        const deltaX = x - this.lastPosition.x;
        const deltaY = y - this.lastPosition.y;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        this.velocityHistory.push(velocity);
        if (this.velocityHistory.length > 5) {
            this.velocityHistory.shift();
        }
        
        const avgVelocity = this.velocityHistory.reduce((sum, v) => sum + v, 0) / this.velocityHistory.length;
        
        const chaos = Math.min(1.0, avgVelocity * 30);
        const speed = 0.5 + Math.min(2.5, avgVelocity * 15);
        const gridDensity = 10 + (y * 90);
        const intensity = 0.4 + (x * 0.6);
        const hue = (280 + avgVelocity * 80) % 360;
        
        updateParam('chaos', chaos.toFixed(2));
        updateParam('speed', speed.toFixed(2));
        updateParam('gridDensity', Math.round(gridDensity));
        updateParam('intensity', intensity.toFixed(2));
        updateParam('hue', Math.round(hue));
        
        this.lastPosition = { x, y };
    }
}

class DistanceMode {
    handleMouseMove(x, y, updateParam) {
        // Holographic center distance logic
        const centerX = 0.5, centerY = 0.5;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = Math.min(distanceFromCenter / 0.707, 1.0);
        
        const gridDensity = 5 + (95 * normalizedDistance);
        const intensity = 0.2 + (0.8 * (1.0 - normalizedDistance));
        const saturation = 0.4 + (0.6 * (1.0 - normalizedDistance));
        const hue = (320 + normalizedDistance * 40) % 360;
        
        updateParam('gridDensity', Math.round(gridDensity));
        updateParam('intensity', intensity.toFixed(2));
        updateParam('saturation', saturation.toFixed(2));
        updateParam('hue', Math.round(hue));
    }
}

/**
 * CLICK MODE CLASSES
 */

class BurstMode {
    constructor() {
        this.isAnimating = false;
        this.effects = {};
    }
    
    handleClick(x, y, updateParam) {
        // Faceted burst effect
        this.effects = {
            colorFlash: 1.0,
            chaosBoost: 0.8,
            speedBoost: 1.5
        };
        
        if (!this.isAnimating) {
            this.startAnimation(updateParam);
        }
    }
    
    startAnimation(updateParam) {
        this.isAnimating = true;
        
        const animate = () => {
            let hasEffects = false;
            
            if (this.effects.colorFlash > 0.01) {
                hasEffects = true;
                // Color flash logic here
                this.effects.colorFlash *= 0.94;
            }
            
            if (this.effects.chaosBoost > 0.01) {
                hasEffects = true;
                updateParam('chaos', (0.2 + this.effects.chaosBoost).toFixed(2));
                this.effects.chaosBoost *= 0.92;
            }
            
            if (this.effects.speedBoost > 0.01) {
                hasEffects = true;
                updateParam('speed', (1.0 + this.effects.speedBoost).toFixed(2));
                this.effects.speedBoost *= 0.91;
            }
            
            if (hasEffects) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        
        animate();
    }
}

class BlastMode {
    constructor() {
        this.isAnimating = false;
        this.effects = {};
    }
    
    handleClick(x, y, updateParam) {
        // Quantum blast effect
        this.effects = {
            flashIntensity: 1.0,
            chaosBlast: 0.7,
            speedWave: 2.0,
            hueShift: 60
        };
        
        if (!this.isAnimating) {
            this.startAnimation(updateParam);
        }
    }
    
    startAnimation(updateParam) {
        this.isAnimating = true;
        
        const animate = () => {
            let hasEffects = false;
            
            Object.keys(this.effects).forEach(key => {
                if (this.effects[key] > 0.01) {
                    hasEffects = true;
                    
                    switch(key) {
                        case 'chaosBlast':
                            updateParam('chaos', Math.min(1.0, 0.3 + this.effects[key]).toFixed(2));
                            this.effects[key] *= 0.88;
                            break;
                        case 'speedWave':
                            updateParam('speed', Math.min(3.0, 1.0 + this.effects[key]).toFixed(2));
                            this.effects[key] *= 0.89;
                            break;
                        case 'hueShift':
                            updateParam('hue', Math.round((280 + this.effects[key]) % 360));
                            this.effects[key] *= 0.90;
                            break;
                    }
                }
            });
            
            if (hasEffects) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };
        
        animate();
    }
}

class RippleMode {
    constructor() {
        this.morphIntensity = 0;
        this.baseMorph = 1.0;
        this.isAnimating = false;
    }
    
    handleClick(x, y, updateParam) {
        // Holographic ripple effect
        const centerX = 0.5, centerY = 0.5;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = Math.min(distance / 0.707, 1.0);
        
        this.morphIntensity = 0.1 + (0.2 * (1.0 - normalizedDistance));
        
        if (!this.isAnimating) {
            this.startAnimation(updateParam);
        }
    }
    
    startAnimation(updateParam) {
        this.isAnimating = true;
        
        const animate = () => {
            if (this.morphIntensity > 0.01) {
                const currentMorph = this.baseMorph + this.morphIntensity;
                updateParam('morphFactor', currentMorph.toFixed(2));
                this.morphIntensity *= 0.9;
                requestAnimationFrame(animate);
            } else {
                updateParam('morphFactor', this.baseMorph.toFixed(2));
                this.isAnimating = false;
            }
        };
        
        animate();
    }
}

/**
 * SCROLL MODE CLASSES
 */

class CycleMode {
    constructor() {
        this.scrollDensity = 15;
        this.scrollHue = 200;
    }
    
    handleWheel(deltaY, updateParam) {
        // Faceted cycle mode
        const direction = deltaY > 0 ? 1 : -1;
        
        this.scrollDensity += direction * 0.8;
        this.scrollDensity = Math.max(5, Math.min(100, this.scrollDensity));
        
        this.scrollHue += direction * 3;
        this.scrollHue = ((this.scrollHue % 360) + 360) % 360;
        
        updateParam('gridDensity', Math.round(this.scrollDensity));
        updateParam('hue', Math.round(this.scrollHue));
    }
}

class WaveMode {
    constructor() {
        this.scrollMorph = 1.0;
    }
    
    handleWheel(deltaY, updateParam) {
        // Quantum wave mode
        const direction = deltaY > 0 ? 1 : -1;
        
        this.scrollMorph += direction * 0.02;
        this.scrollMorph = Math.max(0.2, Math.min(2.0, this.scrollMorph));
        
        updateParam('morphFactor', this.scrollMorph.toFixed(2));
    }
}

class SweepMode {
    constructor() {
        this.sweepParameter = 0; // 0=hue, 1=intensity, 2=saturation, 3=chaos, 4=speed
        this.sweepValues = [200, 0.5, 0.8, 0.2, 1.0]; // Base values
    }
    
    handleWheel(deltaY, updateParam) {
        // New sweep mode - cycles through different parameters
        const direction = deltaY > 0 ? 1 : -1;
        const params = ['hue', 'intensity', 'saturation', 'chaos', 'speed'];
        const ranges = [
            [0, 360],      // hue
            [0.1, 1.0],    // intensity  
            [0.1, 1.0],    // saturation
            [0, 1.0],      // chaos
            [0.1, 3.0]     // speed
        ];
        
        // Update current parameter
        const currentParam = this.sweepParameter;
        const [min, max] = ranges[currentParam];
        const step = (max - min) * 0.02;
        
        this.sweepValues[currentParam] += direction * step;
        this.sweepValues[currentParam] = Math.max(min, Math.min(max, this.sweepValues[currentParam]));
        
        updateParam(params[currentParam], this.sweepValues[currentParam].toFixed(2));
        
        // Occasionally switch to next parameter  
        if (Math.random() < 0.1) {
            this.sweepParameter = (this.sweepParameter + 1) % params.length;
        }
    }
}

// Create global instance
window.reactivityManager = new ReactivityManager();