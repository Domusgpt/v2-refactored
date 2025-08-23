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
        this.setupCenterDistanceReactivity(); // NEW: Center-distance grid density changes
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
            
            // Start audio only if globally enabled and not already started
            if (!this.audioEnabled && window.audioEnabled === true) {
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
        if (!this.audioEnabled || !this.analyser || !this.isActive || window.audioEnabled === false) return;
        
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
    
    setupCenterDistanceReactivity() {
        console.log('✨ Setting up center-distance reactivity + click morph effects for Holographic system');
        
        // Track mouse/touch position for center-distance calculation
        this.currentX = 0.5;
        this.currentY = 0.5;
        
        // Click morph effect state
        this.clickMorphIntensity = 0;
        this.baseMorphFactor = 1.0; // Default morph factor
        
        const holographicCanvases = [
            'holo-background-canvas', 'holo-shadow-canvas', 'holo-content-canvas',
            'holo-highlight-canvas', 'holo-accent-canvas'
        ];
        
        holographicCanvases.forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            // Mouse movement -> center distance -> density/intensity/saturation (NO MORPH)
            canvas.addEventListener('mousemove', (e) => {
                if (!this.isActive) return;
                
                const rect = canvas.getBoundingClientRect();
                const mouseX = (e.clientX - rect.left) / rect.width;
                const mouseY = (e.clientY - rect.top) / rect.height;
                
                this.updateCenterDistanceParameters(mouseX, mouseY);
            });
            
            // Touch movement -> center distance -> parameters (NO MORPH)
            canvas.addEventListener('touchmove', (e) => {
                if (!this.isActive) return;
                e.preventDefault();
                
                if (e.touches.length > 0) {
                    const touch = e.touches[0];
                    const rect = canvas.getBoundingClientRect();
                    const touchX = (touch.clientX - rect.left) / rect.width;
                    const touchY = (touch.clientY - rect.top) / rect.height;
                    
                    this.updateCenterDistanceParameters(touchX, touchY);
                }
            }, { passive: false });
            
            // Click -> morph effect based on distance from center
            canvas.addEventListener('click', (e) => {
                if (!this.isActive) return;
                
                const rect = canvas.getBoundingClientRect();
                const clickX = (e.clientX - rect.left) / rect.width;
                const clickY = (e.clientY - rect.top) / rect.height;
                
                this.triggerHolographicClickMorph(clickX, clickY);
            });
            
            // Touch end -> morph effect based on distance from center
            canvas.addEventListener('touchend', (e) => {
                if (!this.isActive) return;
                
                if (e.changedTouches.length > 0) {
                    const touch = e.changedTouches[0];
                    const rect = canvas.getBoundingClientRect();
                    const touchX = (touch.clientX - rect.left) / rect.width;
                    const touchY = (touch.clientY - rect.top) / rect.height;
                    
                    this.triggerHolographicClickMorph(touchX, touchY);
                }
            });
        });
        
        // Start click morph animation loop
        this.startHolographicClickMorphLoop();
    }
    
    updateCenterDistanceParameters(x, y) {
        // Calculate distance from center (0.5, 0.5)
        const centerX = 0.5;
        const centerY = 0.5;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        // Normalize distance (0 = center, 1 = corners)
        const normalizedDistance = Math.min(distanceFromCenter / 0.707, 1.0);
        
        // REVERSED: Center = low density, edges = high density (as requested)
        const gridDensity = 5 + (95 * normalizedDistance); // 5-100 range
        
        // Enhanced intensity modulation - more dramatic changes
        const intensity = 0.2 + (0.8 * (1.0 - normalizedDistance)); // 0.2-1.0 range (wider)
        
        // Enhanced saturation modulation - more color variation  
        const saturation = 0.4 + (0.6 * (1.0 - normalizedDistance)); // 0.4-1.0 range (wider)
        
        // Hue shift: Subtle color variation based on position
        const baseHue = 320; // Magenta-pink base
        const hueShift = normalizedDistance * 40; // 0-40 degree shift
        const hue = (baseHue + hueShift) % 360;
        
        // Update parameters (NO MORE MORPH FROM MOUSE MOVEMENT)
        if (window.updateParameter) {
            window.updateParameter('gridDensity', Math.round(gridDensity));
            window.updateParameter('intensity', intensity.toFixed(2));
            window.updateParameter('saturation', saturation.toFixed(2));
            window.updateParameter('hue', Math.round(hue));
        }
        
        console.log(`✨ Center distance: ${distanceFromCenter.toFixed(3)} → Density: ${Math.round(gridDensity)}, Intensity: ${intensity.toFixed(2)}, Saturation: ${saturation.toFixed(2)}`);
    }
    
    triggerHolographicClickMorph(x, y) {
        // Calculate distance from center for morph intensity
        const centerX = 0.5;
        const centerY = 0.5;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = Math.min(distanceFromCenter / 0.707, 1.0);
        
        // Morph change based on distance from center (0.1-0.3 as requested)
        this.clickMorphIntensity = 0.1 + (0.2 * (1.0 - normalizedDistance)); // 0.1-0.3 range
        
        console.log(`💥 Holographic click morph: distance=${distanceFromCenter.toFixed(3)}, morph change=${this.clickMorphIntensity.toFixed(2)}`);
    }
    
    startHolographicClickMorphLoop() {
        const morphEffect = () => {
            if (this.clickMorphIntensity > 0.01) {
                // Apply morph change temporarily
                const currentMorph = this.baseMorphFactor + this.clickMorphIntensity;
                
                if (window.updateParameter) {
                    window.updateParameter('morphFactor', currentMorph.toFixed(2));
                }
                
                // Decay back to base morph factor
                this.clickMorphIntensity *= 0.9; // Decay rate
            } else if (this.clickMorphIntensity > 0) {
                // Return to base morph factor
                if (window.updateParameter) {
                    window.updateParameter('morphFactor', this.baseMorphFactor.toFixed(2));
                }
                this.clickMorphIntensity = 0;
            }
            
            if (this.isActive) {
                requestAnimationFrame(morphEffect);
            }
        };
        
        morphEffect();
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