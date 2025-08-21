/**
 * Universal Audio Engine for VIB34D Systems
 * Provides system-specific audio reactivity for all 4 visualization systems
 * Based on deep analysis of each system's unique capabilities and parameters
 */

export class UniversalAudioEngine {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isActive = false;
        this.bufferLength = 0;
        this.dataArray = null;
        this.frequencyBinCount = 0;
        
        // Audio analysis buffers
        this.frequencyData = null;
        this.timeData = null;
        
        // Processed audio data
        this.audioFeatures = {
            bass: 0,          // 20-250 Hz
            mid: 0,           // 250-2000 Hz  
            high: 0,          // 2000-20000 Hz
            energy: 0,        // Overall energy
            transients: 0,    // Sudden changes
            rhythm: 0,        // Rhythm detection
            peak: 0,          // Current peak
            smooth: 0         // Smoothed energy
        };
        
        // Audio history for rhythm detection
        this.energyHistory = new Array(60).fill(0); // 1 second at 60fps
        this.peakHistory = new Array(30).fill(0);   // 0.5 second peak detection
        this.historyIndex = 0;
        
        // System-specific audio mappings
        this.systemMappings = this.createSystemMappings();
        
        // Connected systems
        this.connectedSystems = new Map();
        
        console.log('🎵 Universal Audio Engine initialized');
    }
    
    /**
     * Create system-specific audio parameter mappings
     * Based on deep analysis of each system's unique capabilities
     */
    createSystemMappings() {
        return {
            // FACETED: Simple but impactful geometric pulses
            faceted: {
                bass: {
                    parameter: 'gridDensity',
                    range: [15, 50],
                    mode: 'pulse',
                    intensity: 1.0
                },
                mid: {
                    parameter: 'morphFactor', 
                    range: [0.5, 2.0],
                    mode: 'wave',
                    intensity: 0.8
                },
                high: {
                    parameter: 'speed',
                    range: [0.5, 2.0],
                    mode: 'modulation',
                    intensity: 0.6
                },
                transients: {
                    parameter: 'geometry',
                    range: [0, 7],
                    mode: 'step',
                    intensity: 1.0
                }
            },
            
            // QUANTUM: Multi-frequency lattice orchestra with holographic effects
            quantum: {
                bass: {
                    parameter: 'intensity',
                    range: [0.3, 1.0],
                    mode: 'pulse',
                    intensity: 1.2,
                    latticeBoost: true  // Enhances tetrahedron/hypercube lattice
                },
                mid: {
                    parameter: 'hue',
                    range: [200, 320], 
                    mode: 'wave',
                    intensity: 1.0,
                    particleSystem: true  // Drives particle density
                },
                high: {
                    parameter: 'saturation',
                    range: [0.6, 1.0],
                    mode: 'shimmer',
                    intensity: 0.8,
                    rgbGlitch: true  // Enhances RGB glitch effects
                },
                rhythm: {
                    parameter: 'geometry',
                    range: [0, 7],
                    mode: 'cycle',
                    intensity: 1.0,
                    latticeCycle: true  // Cycles through 8 lattice types
                }
            },
            
            // HOLOGRAPHIC: Already audio-reactive, enhance existing system
            holographic: {
                enhancement: true,  // Enhance existing system rather than replace
                gestureAudio: true, // Add gesture-based audio control
                rhythmMorph: true   // Add rhythm pattern morphing
            },
            
            // POLYCHORA: 4D polytope transformation engine with glass effects
            polychora: {
                bass: {
                    parameter: 'polytope',
                    range: [0, 5],
                    mode: 'morph',
                    intensity: 1.0,
                    polytopeTransform: true  // Morphs between 6 polytope types
                },
                mid: {
                    parameter: 'refractionIndex',
                    range: [1.0, 2.0],
                    mode: 'glass',
                    intensity: 0.9,
                    glassEffects: true  // Cinema-quality glass modulation
                },
                high: {
                    parameter: '4drotations',
                    range: [-3.14159, 3.14159],
                    mode: 'rotation6d',
                    intensity: 1.5,
                    allPlanes: ['rot4dXW', 'rot4dYW', 'rot4dZW', 'rot4dXY', 'rot4dXZ', 'rot4dYZ']
                },
                energy: {
                    parameter: 'chromaticAberration',
                    range: [0.0, 0.5],
                    mode: 'aberration',
                    intensity: 1.0,
                    flowDirection: true  // Affects glass flow direction
                }
            }
        };
    }
    
    /**
     * Initialize audio input (microphone)
     */
    async initialize() {
        try {
            console.log('🎤 Requesting microphone access...');
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            // Create analyzer with high resolution
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;  // High resolution for detailed frequency analysis
            this.analyser.smoothingTimeConstant = 0.3;  // Moderate smoothing
            
            this.bufferLength = this.analyser.frequencyBinCount;
            this.frequencyData = new Uint8Array(this.bufferLength);
            this.timeData = new Uint8Array(this.bufferLength);
            
            // Connect microphone to analyzer
            this.microphone.connect(this.analyser);
            
            console.log('✅ Universal Audio Engine active with microphone');
            this.isActive = true;
            
            return true;
        } catch (error) {
            console.warn('⚠️ Microphone access denied, audio reactivity disabled:', error);
            return false;
        }
    }
    
    /**
     * Connect a visualization system to receive audio data
     */
    connectSystem(systemName, systemInstance) {
        this.connectedSystems.set(systemName, systemInstance);
        console.log(`🔗 Connected ${systemName} system to universal audio`);
    }
    
    /**
     * Disconnect a visualization system
     */
    disconnectSystem(systemName) {
        this.connectedSystems.delete(systemName);
        console.log(`🔌 Disconnected ${systemName} system from universal audio`);
    }
    
    /**
     * Analyze current audio and update all connected systems
     */
    update() {
        if (!this.isActive || !this.analyser) return;
        
        // Get frequency and time domain data
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.timeData);
        
        // Process audio features
        this.processAudioFeatures();
        
        // Update connected systems with system-specific audio data
        this.connectedSystems.forEach((system, systemName) => {
            this.updateSystemAudio(systemName, system);
        });
    }
    
    /**
     * Process raw audio data into meaningful features
     */
    processAudioFeatures() {
        // Calculate frequency bands
        const nyquist = this.audioContext.sampleRate / 2;
        const binWidth = nyquist / this.bufferLength;
        
        // Bass: 20-250 Hz
        const bassStart = Math.floor(20 / binWidth);
        const bassEnd = Math.floor(250 / binWidth);
        let bassSum = 0;
        for (let i = bassStart; i < bassEnd; i++) {
            bassSum += this.frequencyData[i];
        }
        this.audioFeatures.bass = (bassSum / (bassEnd - bassStart)) / 255;
        
        // Mid: 250-2000 Hz
        const midStart = bassEnd;
        const midEnd = Math.floor(2000 / binWidth);
        let midSum = 0;
        for (let i = midStart; i < midEnd; i++) {
            midSum += this.frequencyData[i];
        }
        this.audioFeatures.mid = (midSum / (midEnd - midStart)) / 255;
        
        // High: 2000-20000 Hz
        const highStart = midEnd;
        const highEnd = this.bufferLength;
        let highSum = 0;
        for (let i = highStart; i < highEnd; i++) {
            highSum += this.frequencyData[i];
        }
        this.audioFeatures.high = (highSum / (highEnd - highStart)) / 255;
        
        // Overall energy
        let totalEnergy = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            totalEnergy += this.frequencyData[i];
        }
        this.audioFeatures.energy = totalEnergy / (this.bufferLength * 255);
        
        // Transient detection (sudden energy changes)
        const prevEnergy = this.energyHistory[this.historyIndex];
        const energyDelta = this.audioFeatures.energy - prevEnergy;
        this.audioFeatures.transients = Math.max(0, energyDelta * 10); // Amplify sudden changes
        
        // Rhythm detection (periodic energy patterns)
        this.updateEnergyHistory();
        this.audioFeatures.rhythm = this.detectRhythm();
        
        // Peak detection
        this.audioFeatures.peak = Math.max(this.audioFeatures.bass, this.audioFeatures.mid, this.audioFeatures.high);
        
        // Smooth energy (for gentle animations)
        this.audioFeatures.smooth = this.audioFeatures.energy * 0.1 + this.audioFeatures.smooth * 0.9;
    }
    
    /**
     * Update energy history for rhythm detection
     */
    updateEnergyHistory() {
        this.energyHistory[this.historyIndex] = this.audioFeatures.energy;
        this.historyIndex = (this.historyIndex + 1) % this.energyHistory.length;
    }
    
    /**
     * Detect rhythmic patterns in audio
     */
    detectRhythm() {
        // Simple rhythm detection using energy pattern analysis
        let rhythmStrength = 0;
        const windowSize = 15; // 0.25 seconds at 60fps
        
        for (let i = 0; i < this.energyHistory.length - windowSize; i++) {
            let correlation = 0;
            for (let j = 0; j < windowSize; j++) {
                correlation += this.energyHistory[i + j] * this.energyHistory[i + j + windowSize];
            }
            rhythmStrength = Math.max(rhythmStrength, correlation / windowSize);
        }
        
        return Math.min(rhythmStrength * 2, 1.0);
    }
    
    /**
     * Update specific visualization system with audio data
     */
    updateSystemAudio(systemName, system) {
        if (!this.systemMappings[systemName]) return;
        
        const mapping = this.systemMappings[systemName];
        
        // Handle special case for holographic system (already has audio)
        if (mapping.enhancement) {
            this.enhanceHolographicSystem(system);
            return;
        }
        
        // Process audio mappings for other systems
        Object.entries(mapping).forEach(([audioFeature, config]) => {
            if (!config.parameter) return;
            
            const audioValue = this.audioFeatures[audioFeature] || 0;
            const mappedValue = this.mapAudioToParameter(audioValue, config);
            
            // Apply system-specific enhancements
            this.applySystemSpecificEffects(systemName, system, audioFeature, config, mappedValue);
        });
    }
    
    /**
     * Map audio value to parameter range with different modes
     */
    mapAudioToParameter(audioValue, config) {
        const { range, mode, intensity } = config;
        const [min, max] = range;
        let mappedValue;
        
        switch (mode) {
            case 'pulse':
                // Sharp pulses for impactful effects
                mappedValue = min + (max - min) * Math.pow(audioValue * intensity, 2);
                break;
                
            case 'wave':
                // Smooth waves for fluid animations  
                mappedValue = min + (max - min) * (0.5 + 0.5 * Math.sin(audioValue * intensity * Math.PI));
                break;
                
            case 'modulation':
                // Frequency modulation for speed/rotation
                mappedValue = (min + max) / 2 + (max - min) * 0.5 * audioValue * intensity;
                break;
                
            case 'step':
                // Discrete steps for parameter switching
                mappedValue = Math.floor(min + (max - min + 1) * audioValue * intensity);
                break;
                
            case 'morph':
                // Smooth morphing between states
                mappedValue = min + (max - min) * this.smoothTransition(audioValue * intensity);
                break;
                
            case 'glass':
                // Glass effect modulation
                mappedValue = min + (max - min) * (audioValue * intensity * 0.8 + 0.2);
                break;
                
            case 'rotation6d':
                // 6D rotation modulation
                mappedValue = (audioValue * intensity - 0.5) * (max - min);
                break;
                
            case 'aberration':
                // Chromatic aberration effect
                mappedValue = min + (max - min) * Math.pow(audioValue * intensity, 1.5);
                break;
                
            default:
                // Linear mapping
                mappedValue = min + (max - min) * audioValue * intensity;
        }
        
        return Math.max(min, Math.min(max, mappedValue));
    }
    
    /**
     * Smooth transition function for morphing effects
     */
    smoothTransition(x) {
        // S-curve for smooth transitions
        return x * x * (3 - 2 * x);
    }
    
    /**
     * Apply system-specific audio effects
     */
    applySystemSpecificEffects(systemName, system, audioFeature, config, mappedValue) {
        switch (systemName) {
            case 'faceted':
                this.applyFacetedEffects(system, audioFeature, config, mappedValue);
                break;
                
            case 'quantum':
                this.applyQuantumEffects(system, audioFeature, config, mappedValue);
                break;
                
            case 'polychora':
                this.applyPolychoraEffects(system, audioFeature, config, mappedValue);
                break;
        }
    }
    
    /**
     * Apply audio effects to Faceted system
     */
    applyFacetedEffects(system, audioFeature, config, mappedValue) {
        if (audioFeature === 'transients' && this.audioFeatures.transients > 0.3) {
            // Geometry switching on strong transients
            if (system.updateParameter) {
                system.updateParameter('geometry', Math.floor(mappedValue));
            }
        } else if (config.parameter && system.updateParameter) {
            system.updateParameter(config.parameter, mappedValue);
        }
    }
    
    /**
     * Apply audio effects to Quantum system
     */
    applyQuantumEffects(system, audioFeature, config, mappedValue) {
        if (config.latticeBoost && this.audioFeatures.bass > 0.4) {
            // Boost intensity for bass hits with lattice enhancement
            if (system.updateParameter) {
                system.updateParameter('intensity', Math.min(1.0, mappedValue + 0.3));
            }
        } else if (config.particleSystem && system.updateParameter) {
            // Particle system density modulation
            system.updateParameter(config.parameter, mappedValue);
        } else if (config.rgbGlitch && system.updateParameter) {
            // RGB glitch enhancement
            system.updateParameter(config.parameter, mappedValue);
        } else if (config.latticeCycle && this.audioFeatures.rhythm > 0.5) {
            // Lattice type cycling on rhythm
            if (system.updateParameter) {
                const currentTime = Date.now();
                const cycleGeometry = Math.floor((currentTime / 2000) % 8); // 2-second cycles
                system.updateParameter('geometry', cycleGeometry);
            }
        } else if (config.parameter && system.updateParameter) {
            system.updateParameter(config.parameter, mappedValue);
        }
    }
    
    /**
     * Apply audio effects to Polychora system  
     */
    applyPolychoraEffects(system, audioFeature, config, mappedValue) {
        if (config.polytopeTransform && system.updateParameter) {
            // Smooth polytope morphing based on bass
            const polytype = Math.floor(mappedValue);
            system.updateParameter('polytope', polytype);
            
        } else if (config.glassEffects && system.updateParameter) {
            // Cinema-quality glass effects
            system.updateParameter(config.parameter, mappedValue);
            
        } else if (config.allPlanes && system.updateParameter) {
            // 6D rotation control - each plane reacts differently
            config.allPlanes.forEach((plane, index) => {
                const phaseOffset = (index * Math.PI * 2) / 6; // 60-degree phase offsets
                const rotationValue = mappedValue * Math.sin(Date.now() * 0.001 + phaseOffset);
                system.updateParameter(plane, rotationValue);
            });
            
        } else if (config.flowDirection && system.updateParameter) {
            // Glass flow direction based on audio energy
            const flowAngle = this.audioFeatures.energy * 360;
            system.updateParameter('flowDirection', flowAngle);
            system.updateParameter(config.parameter, mappedValue);
            
        } else if (config.parameter && system.updateParameter) {
            system.updateParameter(config.parameter, mappedValue);
        }
    }
    
    /**
     * Enhance existing holographic system (already has audio)
     */
    enhanceHolographicSystem(system) {
        // Add rhythm pattern morphing and gesture audio control
        // This integrates with the existing sophisticated audio system
        if (system.updateAudioEnhancement) {
            system.updateAudioEnhancement({
                rhythmMorph: this.audioFeatures.rhythm,
                gestureControl: true,
                enhancedTransients: this.audioFeatures.transients
            });
        }
    }
    
    /**
     * Get current audio features for external use
     */
    getAudioFeatures() {
        return { ...this.audioFeatures };
    }
    
    /**
     * Enable/disable audio processing
     */
    setEnabled(enabled) {
        this.isActive = enabled;
        console.log(`🎵 Universal Audio Engine ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Clean up audio resources
     */
    destroy() {
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.connectedSystems.clear();
        console.log('🧹 Universal Audio Engine destroyed');
    }
}

// Global instance
window.universalAudio = new UniversalAudioEngine();