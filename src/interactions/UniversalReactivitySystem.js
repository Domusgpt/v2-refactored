/**
 * Universal Reactivity System - Audio, Mouse, Touch, and Keyboard interactions for all systems
 * Provides the same level of interactivity as the holographic system to all other systems
 */

export class UniversalReactivitySystem {
    constructor() {
        // Audio reactivity system
        this.audioEnabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.frequencyData = null;
        this.audioData = { bass: 0, mid: 0, high: 0, energy: 0, rhythm: 0, melody: 0 };
        
        // Mouse/touch interaction state
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        this.touchActive = false;
        this.touchMorph = 0.0;
        this.touchChaos = 0.0;
        
        // Scroll interaction state
        this.scrollPosition = 0.0;
        this.scrollVelocity = 0.0;
        this.scrollDecay = 0.92;
        this.parallaxDepth = 0.0;
        this.gridDensityShift = 0.0;
        this.colorScrollShift = 0.0;
        
        // Audio smoothing
        this.audioSmoothing = { bass: 0, mid: 0, high: 0 };
        this.previousBass = 0;
        
        // Systems that are using this reactivity
        this.connectedSystems = [];
        
        console.log('🎵 Universal Reactivity System initialized');
    }
    
    /**
     * Connect a system to universal reactivity
     */
    connectSystem(system, systemName) {
        this.connectedSystems.push({ system, name: systemName });
        console.log(`🔗 Connected ${systemName} to universal reactivity`);
        
        // If this is the first system and we don't have audio yet, initialize it
        if (this.connectedSystems.length === 1 && !this.audioEnabled) {
            this.initAudio();
        }
    }
    
    /**
     * Disconnect a system from universal reactivity
     */
    disconnectSystem(systemName) {
        this.connectedSystems = this.connectedSystems.filter(s => s.name !== systemName);
        console.log(`🔌 Disconnected ${systemName} from universal reactivity`);
    }
    
    /**
     * Initialize audio reactivity system
     */
    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            
            const constraints = {
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.audioEnabled = true;
            console.log('🎵 Universal audio reactivity enabled');
            
            // Start the reactivity update loop
            this.startReactivityLoop();
            
        } catch (error) {
            console.warn('⚠️ Audio initialization failed (will continue without audio):', error);
            // Continue without audio - other interactions still work
            this.startReactivityLoop();
        }
    }
    
    /**
     * Start the main reactivity update loop
     */
    startReactivityLoop() {
        const updateLoop = () => {
            // Update audio data
            this.updateAudio();
            
            // Decay interactive effects
            this.mouseIntensity *= 0.95;
            this.clickIntensity *= 0.92;
            this.touchMorph *= 0.94;
            this.touchChaos *= 0.94;
            this.scrollVelocity *= this.scrollDecay;
            
            // Update scroll effects
            this.updateScrollEffects();
            
            // Apply to all connected systems
            this.applyToSystems();
            
            requestAnimationFrame(updateLoop);
        };
        
        updateLoop();
        console.log('🔄 Universal reactivity loop started');
    }
    
    /**
     * Update audio analysis data
     */
    updateAudio() {
        if (!this.audioEnabled || !this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        const bassEnd = Math.floor(this.frequencyData.length * 0.1);
        const midEnd = Math.floor(this.frequencyData.length * 0.4);
        
        let bass = 0, mid = 0, high = 0;
        
        for (let i = 0; i < bassEnd; i++) {
            bass += this.frequencyData[i];
        }
        bass /= (bassEnd * 255);
        
        for (let i = bassEnd; i < midEnd; i++) {
            mid += this.frequencyData[i];
        }
        mid /= ((midEnd - bassEnd) * 255);
        
        for (let i = midEnd; i < this.frequencyData.length; i++) {
            high += this.frequencyData[i];
        }
        high /= ((this.frequencyData.length - midEnd) * 255);
        
        // Enhanced audio processing
        this.audioData = {
            bass: this.smoothAudioValue(bass, 'bass'),
            mid: this.smoothAudioValue(mid, 'mid'), 
            high: this.smoothAudioValue(high, 'high'),
            energy: (bass + mid + high) / 3,
            rhythm: this.detectRhythm(bass),
            melody: this.detectMelody(mid, high)
        };
    }
    
    /**
     * Smooth audio values to prevent jarring changes
     */
    smoothAudioValue(currentValue, type) {
        const smoothingFactor = 0.4;
        this.audioSmoothing[type] = this.audioSmoothing[type] * smoothingFactor + currentValue * (1 - smoothingFactor);
        
        const threshold = 0.05;
        return this.audioSmoothing[type] > threshold ? this.audioSmoothing[type] : 0;
    }
    
    /**
     * Detect rhythm beats
     */
    detectRhythm(bassLevel) {
        const beatDetected = bassLevel > this.previousBass + 0.2;
        this.previousBass = bassLevel;
        return beatDetected ? 1.0 : 0.0;
    }
    
    /**
     * Detect melodic activity
     */
    detectMelody(midLevel, highLevel) {
        const melodicActivity = (midLevel + highLevel) / 2;
        return melodicActivity > 0.3 ? melodicActivity : 0.0;
    }
    
    /**
     * Update scroll-based effects
     */
    updateScrollEffects() {
        this.parallaxDepth = this.scrollVelocity * 0.1;
        this.gridDensityShift = Math.sin(this.scrollPosition * 0.02) * 2.0;
        this.colorScrollShift = (this.scrollPosition * 0.02) % (Math.PI * 2);
    }
    
    /**
     * Apply reactivity data to all connected systems
     */
    applyToSystems() {
        this.connectedSystems.forEach(({ system, name }) => {
            try {
                // Apply audio reactivity if the system supports it
                if (system.updateAudioReactivity) {
                    system.updateAudioReactivity(this.audioData);
                } else if (system.updateAudio) {
                    system.updateAudio(this.audioData);
                }
                
                // Apply mouse/touch reactivity
                if (system.updateInteraction) {
                    system.updateInteraction(this.mouseX, this.mouseY, this.mouseIntensity);
                }
                
                // Apply click effects
                if (system.updateClick && this.clickIntensity > 0.1) {
                    system.updateClick(this.clickIntensity);
                }
                
                // Apply scroll effects
                if (system.updateScroll) {
                    system.updateScroll(this.scrollVelocity);
                }
                
            } catch (error) {
                console.warn(`⚠️ Error applying reactivity to ${name}:`, error);
            }
        });
    }
    
    /**
     * Set up universal mouse interactions
     */
    setupUniversalInteractions() {
        // Mouse tracking system
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = 1.0 - (e.clientY / window.innerHeight);
            this.mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
        });
        
        // Click interactions
        document.addEventListener('click', (e) => {
            const rect = document.body.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = 1.0 - ((e.clientY - rect.top) / rect.height);
            
            this.clickIntensity = Math.min(1.0, this.clickIntensity + 0.5);
        });
        
        // Touch interactions
        this.setupTouchInteractions();
        
        // Scroll interactions  
        this.setupScrollInteractions();
        
        console.log('🎮 Universal interactions enabled');
    }
    
    /**
     * Set up touch interactions
     */
    setupTouchInteractions() {
        let currentTouch = null;
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault();
                currentTouch = e.touches[0];
                touchStartTime = Date.now();
                this.touchActive = true;
                
                const touchX = currentTouch.clientX / window.innerWidth;
                const touchY = 1.0 - (currentTouch.clientY / window.innerHeight);
                
                this.mouseX = touchX;
                this.mouseY = touchY;
                this.clickIntensity = Math.min(1.0, this.clickIntensity + 0.3);
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (!currentTouch || e.touches.length === 0) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            const touchX = touch.clientX / window.innerWidth;
            const touchY = 1.0 - (touch.clientY / window.innerHeight);
            
            this.mouseX = touchX;
            this.mouseY = touchY;
            this.mouseIntensity = 0.7;
            
            // Touch morphing effects
            const deltaX = touch.clientX - currentTouch.clientX;
            const deltaY = touch.clientY - currentTouch.clientY;
            const delta = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            
            this.touchMorph = Math.min(1.0, delta / 100);
            this.touchChaos = Math.min(0.5, delta / 200);
            
            currentTouch = touch;
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (currentTouch) {
                const touchDuration = Date.now() - touchStartTime;
                
                if (touchDuration < 150) {
                    // Quick tap - boost click intensity
                    this.clickIntensity = Math.min(1.0, this.clickIntensity + 0.4);
                }
                
                this.touchActive = false;
                this.mouseIntensity = 0.0;
                currentTouch = null;
            }
        }, { passive: false });
    }
    
    /**
     * Set up scroll interactions
     */
    setupScrollInteractions() {
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            this.scrollVelocity += e.deltaY * 0.001;
            this.scrollPosition += e.deltaY * 0.01;
            
            // Boost effects based on scroll intensity
            this.mouseIntensity = Math.min(1.0, Math.abs(e.deltaY) / 100);
            
        }, { passive: false });
    }
    
    /**
     * Get current reactivity state for systems that want to poll instead of push
     */
    getReactivityState() {
        return {
            audio: this.audioData,
            mouse: {
                x: this.mouseX,
                y: this.mouseY,
                intensity: this.mouseIntensity
            },
            click: {
                intensity: this.clickIntensity
            },
            touch: {
                active: this.touchActive,
                morph: this.touchMorph,
                chaos: this.touchChaos
            },
            scroll: {
                position: this.scrollPosition,
                velocity: this.scrollVelocity,
                parallax: this.parallaxDepth,
                densityShift: this.gridDensityShift,
                colorShift: this.colorScrollShift
            }
        };
    }
    
    /**
     * Toggle audio reactivity on/off
     */
    toggleAudio() {
        if (!this.audioContext) {
            this.initAudio();
        } else if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            console.log('🎵 Audio reactivity resumed');
        } else {
            this.audioContext.suspend();
            console.log('🔇 Audio reactivity paused');
        }
    }
    
    /**
     * Get audio permission status
     */
    getAudioStatus() {
        return {
            enabled: this.audioEnabled,
            state: this.audioContext?.state || 'not-initialized',
            permission: navigator.permissions ? 'unknown' : 'not-supported'
        };
    }
}

// Create global instance
window.universalReactivity = new UniversalReactivitySystem();
export default window.universalReactivity;