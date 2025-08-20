/**
 * REAL Holographic System - Modified for holo-* canvas IDs
 * Uses the elaborate effects from active-holographic-systems-FIXED
 * Audio reactive only - no mouse/touch/scroll interference
 */
import { HolographicVisualizer } from './HolographicVisualizer.js';

export class RealHolographicSystem {
    constructor() {
        this.visualizers = [];
        this.currentVariant = 0;
        this.baseVariants = 30; // Original 30 variations
        this.totalVariants = 30;
        this.isActive = false;
        
        // Audio reactivity system
        this.audioEnabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.frequencyData = null;
        this.audioData = { bass: 0, mid: 0, high: 0 };
        
        // Variant names for display - SEQUENTIAL ORDER
        this.variantNames = [
            // 0-3: TETRAHEDRON variations
            'TETRAHEDRON LATTICE', 'TETRAHEDRON FIELD', 'TETRAHEDRON MATRIX', 'TETRAHEDRON RESONANCE',
            // 4-7: HYPERCUBE variations
            'HYPERCUBE LATTICE', 'HYPERCUBE FIELD', 'HYPERCUBE MATRIX', 'HYPERCUBE QUANTUM',
            // 8-11: SPHERE variations
            'SPHERE LATTICE', 'SPHERE FIELD', 'SPHERE MATRIX', 'SPHERE RESONANCE',
            // 12-15: TORUS variations
            'TORUS LATTICE', 'TORUS FIELD', 'TORUS MATRIX', 'TORUS QUANTUM',
            // 16-19: KLEIN BOTTLE variations
            'KLEIN BOTTLE LATTICE', 'KLEIN BOTTLE FIELD', 'KLEIN BOTTLE MATRIX', 'KLEIN BOTTLE QUANTUM',
            // 20-22: FRACTAL variations
            'FRACTAL LATTICE', 'FRACTAL FIELD', 'FRACTAL QUANTUM',
            // 23-25: WAVE variations
            'WAVE LATTICE', 'WAVE FIELD', 'WAVE QUANTUM',
            // 26-29: CRYSTAL variations
            'CRYSTAL LATTICE', 'CRYSTAL FIELD', 'CRYSTAL MATRIX', 'CRYSTAL QUANTUM'
        ];
        
        this.initialize();
    }
    
    initialize() {
        console.log('🎨 Initializing REAL Holographic System for Active Holograms tab...');
        this.createVisualizers();
        this.setupInteractions(); // FULL interactions - mouse, click, touch, scroll
        this.updateVariantDisplay();
        this.startRenderLoop();
    }
    
    createVisualizers() {
        // Create the 5 visualizers using HOLO canvas IDs
        const layers = [
            { id: 'holo-background-canvas', role: 'background', reactivity: 0.5 },
            { id: 'holo-shadow-canvas', role: 'shadow', reactivity: 0.7 },
            { id: 'holo-content-canvas', role: 'content', reactivity: 0.9 },
            { id: 'holo-highlight-canvas', role: 'highlight', reactivity: 1.1 },
            { id: 'holo-accent-canvas', role: 'accent', reactivity: 1.5 }
        ];
        
        let successfulLayers = 0;
        layers.forEach(layer => {
            try {
                // Check if canvas element exists
                const canvas = document.getElementById(layer.id);
                if (!canvas) {
                    console.error(`❌ Canvas not found: ${layer.id}`);
                    return;
                }
                
                console.log(`🔍 Creating holographic visualizer for: ${layer.id}`);
                const visualizer = new HolographicVisualizer(layer.id, layer.role, layer.reactivity, this.currentVariant);
                
                if (visualizer.gl) {
                    this.visualizers.push(visualizer);
                    successfulLayers++;
                    console.log(`✅ Created REAL holographic layer: ${layer.role} (${layer.id})`);
                } else {
                    console.error(`❌ No WebGL context for: ${layer.id}`);
                }
            } catch (error) {
                console.error(`❌ Failed to create REAL holographic layer ${layer.id}:`, error);
            }
        });
        
        console.log(`✅ Created ${successfulLayers}/5 REAL holographic layers`);
        
        if (successfulLayers === 0) {
            console.error('🚨 NO HOLOGRAPHIC VISUALIZERS CREATED! Check canvas elements and WebGL support.');
        }
    }
    
    setActive(active) {
        this.isActive = active;
        
        if (active) {
            // Show holographic layers (from clean interface)
            const holoLayers = document.getElementById('holographicLayers');
            if (holoLayers) {
                holoLayers.style.display = 'block';
            }
            
            // Start audio if not already started
            if (!this.audioEnabled) {
                this.initAudio();
            }
            console.log('🌌 REAL Active Holograms ACTIVATED with audio reactivity');
        } else {
            // Hide holographic layers
            const holoLayers = document.getElementById('holographicLayers');
            if (holoLayers) {
                holoLayers.style.display = 'none';
            }
            console.log('🌌 REAL Active Holograms DEACTIVATED');
        }
    }
    
    
    updateVariantDisplay() {
        // This will be called by the main UI system
        const variantName = this.variantNames[this.currentVariant];
        return {
            variant: this.currentVariant,
            name: variantName,
            geometryType: Math.floor(this.currentVariant / 4)
        };
    }
    
    nextVariant() {
        this.updateVariant(this.currentVariant + 1);
    }
    
    previousVariant() {
        this.updateVariant(this.currentVariant - 1);
    }
    
    randomVariant() {
        const randomIndex = Math.floor(Math.random() * this.totalVariants);
        this.updateVariant(randomIndex);
    }
    
    setVariant(variant) {
        this.updateVariant(variant);
    }
    
    updateParameter(param, value) {
        // Store custom parameter overrides
        if (!this.customParams) {
            this.customParams = {};
        }
        this.customParams[param] = value;
        
        console.log(`🌌 Updating holographic ${param}: ${value} (${this.visualizers.length} visualizers)`);
        
        // CRITICAL FIX: Call updateParameters method on ALL visualizers for immediate render
        this.visualizers.forEach((visualizer, index) => {
            try {
                if (visualizer.updateParameters) {
                    // Use new updateParameters method with proper parameter mapping
                    const params = {};
                    params[param] = value;
                    visualizer.updateParameters(params);
                    console.log(`✅ Updated holographic layer ${index} (${visualizer.role}) with ${param}=${value}`);
                } else {
                    console.warn(`⚠️ Holographic layer ${index} missing updateParameters method, using fallback`);
                    // Fallback for older method (direct parameter setting)
                    if (visualizer.variantParams) {
                        visualizer.variantParams[param] = value;
                        
                        // If it's a geometry type change, regenerate role params with new geometry
                        if (param === 'geometryType') {
                            visualizer.roleParams = visualizer.generateRoleParams(visualizer.role);
                        }
                        
                        // Force manual render for older visualizers
                        if (visualizer.render) {
                            visualizer.render();
                        }
                    }
                }
            } catch (error) {
                console.error(`❌ Failed to update holographic layer ${index}:`, error);
            }
        });
        
        console.log(`🔄 Holographic parameter update complete: ${param}=${value}`);
    }
    
    // Override updateVariant to preserve custom parameters
    updateVariant(newVariant) {
        if (newVariant < 0) newVariant = this.totalVariants - 1;
        if (newVariant >= this.totalVariants) newVariant = 0;
        
        this.currentVariant = newVariant;
        
        // Update all visualizers with new variant parameters
        this.visualizers.forEach(visualizer => {
            visualizer.variant = this.currentVariant;
            visualizer.variantParams = visualizer.generateVariantParams(this.currentVariant);
            visualizer.roleParams = visualizer.generateRoleParams(visualizer.role);
            
            // Apply any custom parameter overrides
            if (this.customParams) {
                Object.keys(this.customParams).forEach(param => {
                    visualizer.variantParams[param] = this.customParams[param];
                });
            }
        });
        
        this.updateVariantDisplay();
        console.log(`🔄 REAL Holograms switched to variant ${this.currentVariant + 1}: ${this.variantNames[this.currentVariant]}`);
    }
    
    getCurrentVariantInfo() {
        return {
            variant: this.currentVariant,
            name: this.variantNames[this.currentVariant],
            geometryType: Math.floor(this.currentVariant / 4)
        };
    }
    
    /**
     * Get current parameters for saving/export (CRITICAL for gallery saving)
     */
    getParameters() {
        // Collect parameters from UI sliders - same as other systems
        const params = {
            geometry: Math.floor(this.currentVariant / 4), // Extract geometry from variant
            gridDensity: parseFloat(document.getElementById('gridDensity')?.value || 15),
            morphFactor: parseFloat(document.getElementById('morphFactor')?.value || 1.0),
            chaos: parseFloat(document.getElementById('chaos')?.value || 0.2),
            speed: parseFloat(document.getElementById('speed')?.value || 1.0),
            hue: parseFloat(document.getElementById('hue')?.value || 320),
            intensity: parseFloat(document.getElementById('intensity')?.value || 0.6),
            saturation: parseFloat(document.getElementById('saturation')?.value || 0.8),
            rot4dXW: parseFloat(document.getElementById('rot4dXW')?.value || 0.0),
            rot4dYW: parseFloat(document.getElementById('rot4dYW')?.value || 0.0),
            rot4dZW: parseFloat(document.getElementById('rot4dZW')?.value || 0.0),
            variant: this.currentVariant
        };
        
        // Apply any custom parameter overrides
        if (this.customParams) {
            Object.assign(params, this.customParams);
        }
        
        console.log('🌌 Holographic system getParameters:', params);
        return params;
    }
    
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
            console.log('🎵 REAL Holograms audio reactivity enabled');
        } catch (error) {
            console.error('REAL Holograms audio initialization failed:', error);
        }
    }
    
    updateAudio() {
        if (!this.audioEnabled || !this.analyser || !this.isActive) return;
        
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
        
        // Enhanced audio processing for better visual response
        const smoothedAudio = {
            bass: this.smoothAudioValue(bass, 'bass'),
            mid: this.smoothAudioValue(mid, 'mid'), 
            high: this.smoothAudioValue(high, 'high'),
            energy: (bass + mid + high) / 3,
            rhythm: this.detectRhythm(bass),
            melody: this.detectMelody(mid, high)
        };
        
        this.audioData = smoothedAudio;
        
        // Apply audio reactivity to all visualizers
        this.visualizers.forEach(visualizer => {
            visualizer.updateAudio(this.audioData);
        });
    }
    
    smoothAudioValue(currentValue, type) {
        if (!this.audioSmoothing) {
            this.audioSmoothing = { bass: 0, mid: 0, high: 0 };
        }
        
        const smoothingFactor = 0.4;
        this.audioSmoothing[type] = this.audioSmoothing[type] * smoothingFactor + currentValue * (1 - smoothingFactor);
        
        const threshold = 0.05;
        return this.audioSmoothing[type] > threshold ? this.audioSmoothing[type] : 0;
    }
    
    detectRhythm(bassLevel) {
        if (!this.previousBass) this.previousBass = 0;
        const beatDetected = bassLevel > this.previousBass + 0.2;
        this.previousBass = bassLevel;
        return beatDetected ? 1.0 : 0.0;
    }
    
    detectMelody(midLevel, highLevel) {
        const melodicActivity = (midLevel + highLevel) / 2;
        return melodicActivity > 0.3 ? melodicActivity : 0.0;
    }
    
    setupInteractions() {
        // Mouse tracking system
        document.addEventListener('mousemove', (e) => {
            if (!this.isActive) return;
            
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = 1.0 - (e.clientY / window.innerHeight);
            const mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            // Update all visualizers
            this.visualizers.forEach(visualizer => {
                visualizer.updateInteraction(mouseX, mouseY, mouseIntensity);
            });
            
            // Density variation based on mouse position
            const densityVar = Math.sin(mouseX * Math.PI) * Math.sin(mouseY * Math.PI) * 2.0;
            this.visualizers.forEach(visualizer => {
                visualizer.updateDensity(densityVar);
            });
        });
        
        // Click interactions
        document.addEventListener('click', (e) => {
            if (!this.isActive) return;
            
            const rect = document.body.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = 1.0 - ((e.clientY - rect.top) / rect.height);
            
            // Trigger click effect on all visualizers
            this.visualizers.forEach(visualizer => {
                visualizer.triggerClick(clickX, clickY);
            });
        });
        
        // Touch interactions
        this.setupTouchInteractions();
        
        // Scroll interactions  
        this.setupScrollInteractions();
        
        // Keyboard shortcuts for Active Holograms tab
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            // Skip if user is focused on a button or input
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.previousVariant();
                    updateHoloDisplay();
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.nextVariant();
                    updateHoloDisplay();
                    e.preventDefault();
                    break;
                case ' ':
                    this.randomVariant();
                    updateHoloDisplay();
                    e.preventDefault();
                    break;
            }
        });
    }
    
    setupTouchInteractions() {
        let currentTouch = null;
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (!this.isActive) return;
            
            if (e.touches.length > 0) {
                e.preventDefault();
                currentTouch = e.touches[0];
                touchStartTime = Date.now();
                const touchX = currentTouch.clientX / window.innerWidth;
                const touchY = 1.0 - (currentTouch.clientY / window.innerHeight);
                
                this.visualizers.forEach(visualizer => {
                    visualizer.triggerClick(touchX, touchY);
                    visualizer.updateTouch(touchX, touchY, true);
                });
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (!this.isActive || !currentTouch) return;
            
            if (e.touches.length > 0) {
                e.preventDefault();
                const touch = e.touches[0];
                const touchX = touch.clientX / window.innerWidth;
                const touchY = 1.0 - (touch.clientY / window.innerHeight);
                
                this.visualizers.forEach(visualizer => {
                    visualizer.updateTouch(touchX, touchY, true);
                });
                
                currentTouch = touch;
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (!this.isActive) return;
            
            if (currentTouch) {
                const touchDuration = Date.now() - touchStartTime;
                
                if (touchDuration < 150) {
                    this.visualizers.forEach(visualizer => {
                        visualizer.clickIntensity = Math.min(1.0, visualizer.clickIntensity + 0.3);
                    });
                }
                
                this.visualizers.forEach(visualizer => {
                    visualizer.updateTouch(0.5, 0.5, false);
                });
                currentTouch = null;
            }
        }, { passive: false });
    }
    
    setupScrollInteractions() {
        document.addEventListener('wheel', (e) => {
            if (!this.isActive) return;
            
            e.preventDefault();
            
            this.visualizers.forEach(visualizer => {
                visualizer.updateScroll(e.deltaY);
            });
        }, { passive: false });
    }
    
    startRenderLoop() {
        const render = () => {
            if (this.isActive) {
                // Update audio reactivity
                this.updateAudio();
                
                // Render all visualizers
                this.visualizers.forEach(visualizer => {
                    visualizer.render();
                });
            }
            
            requestAnimationFrame(render);
        };
        
        render();
        console.log('🎬 REAL Holographic render loop started');
    }
    
    getVariantName(variant = this.currentVariant) {
        return this.variantNames[variant] || 'UNKNOWN';
    }
    
    destroy() {
        this.visualizers.forEach(visualizer => {
            if (visualizer.destroy) {
                visualizer.destroy();
            }
        });
        this.visualizers = [];
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🧹 REAL Holographic System destroyed');
    }
}