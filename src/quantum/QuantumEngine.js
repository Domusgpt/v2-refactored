/**
 * VIB34D Quantum Engine
 * Manages the enhanced quantum system with complex 3D lattice functions
 */

import { QuantumHolographicVisualizer } from './QuantumVisualizer.js';
import { ParameterManager } from '../core/Parameters.js';
import { GeometryLibrary } from '../geometry/GeometryLibrary.js';

export class QuantumEngine {
    constructor() {
        console.log('🔮 Initializing VIB34D Quantum Engine...');
        
        this.visualizers = [];
        this.parameters = new ParameterManager();
        this.isActive = false;
        
        // Initialize with quantum-enhanced defaults
        this.parameters.setParameter('hue', 280); // Purple-blue for quantum
        this.parameters.setParameter('intensity', 0.7); // Higher intensity
        this.parameters.setParameter('saturation', 0.9); // More vivid
        this.parameters.setParameter('gridDensity', 20); // Denser patterns
        
        this.init();
    }
    
    /**
     * Initialize the quantum system
     */
    init() {
        this.createVisualizers();
        this.startRenderLoop();
        console.log('✨ Quantum Engine initialized with enhanced holographic effects');
    }
    
    /**
     * Create quantum visualizers for all 5 layers
     */
    createVisualizers() {
        const layers = [
            { id: 'quantum-background-canvas', role: 'background', reactivity: 0.4 },
            { id: 'quantum-shadow-canvas', role: 'shadow', reactivity: 0.6 },
            { id: 'quantum-content-canvas', role: 'content', reactivity: 1.0 },
            { id: 'quantum-highlight-canvas', role: 'highlight', reactivity: 1.3 },
            { id: 'quantum-accent-canvas', role: 'accent', reactivity: 1.6 }
        ];
        
        layers.forEach(layer => {
            try {
                // Create canvas element if it doesn't exist
                let canvas = document.getElementById(layer.id);
                if (!canvas) {
                    canvas = document.createElement('canvas');
                    canvas.id = layer.id;
                    canvas.className = 'visualizer-canvas';
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.pointerEvents = 'none';
                    
                    // Add to quantum layers container
                    const quantumLayers = document.getElementById('quantumLayers');
                    if (quantumLayers) {
                        quantumLayers.appendChild(canvas);
                    }
                }
                
                const visualizer = new QuantumHolographicVisualizer(layer.id, layer.role, layer.reactivity, 0);
                if (visualizer.gl) {
                    this.visualizers.push(visualizer);
                    console.log(`🌌 Created quantum layer: ${layer.role}`);
                }
            } catch (error) {
                console.warn(`Failed to create quantum layer ${layer.id}:`, error);
            }
        });
        
        console.log(`✅ Created ${this.visualizers.length} quantum visualizers with enhanced effects`);
    }
    
    /**
     * Set system active/inactive
     */
    setActive(active) {
        this.isActive = active;
        
        if (active) {
            // Show quantum layers
            const quantumLayers = document.getElementById('quantumLayers');
            if (quantumLayers) {
                quantumLayers.style.display = 'block';
            }
            console.log('🔮 Quantum System ACTIVATED - Enhanced holographic mode');
        } else {
            // Hide quantum layers
            const quantumLayers = document.getElementById('quantumLayers');
            if (quantumLayers) {
                quantumLayers.style.display = 'none';
            }
            console.log('🔮 Quantum System DEACTIVATED');
        }
    }
    
    /**
     * Update parameter across all quantum visualizers with enhanced integration
     */
    updateParameter(param, value) {
        // Update internal parameter manager
        this.parameters.setParameter(param, value);
        
        // CRITICAL: Apply to all quantum visualizers with immediate render
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateParameters) {
                const params = {};
                params[param] = value;
                visualizer.updateParameters(params);
            } else {
                // Fallback: direct parameter update with manual render
                if (visualizer.params) {
                    visualizer.params[param] = value;
                    if (visualizer.render) {
                        visualizer.render();
                    }
                }
            }
        });
        
        console.log(`🔮 Updated quantum ${param}: ${value}`);
    }
    
    /**
     * Update multiple parameters
     */
    updateParameters(params) {
        Object.keys(params).forEach(param => {
            this.updateParameter(param, params[param]);
        });
    }
    
    /**
     * Update mouse interaction
     */
    updateInteraction(x, y, intensity) {
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateInteraction) {
                visualizer.updateInteraction(x, y, intensity);
            }
        });
    }
    
    /**
     * Get current parameters for saving/export
     */
    getParameters() {
        return this.parameters.getAllParameters();
    }
    
    /**
     * Set parameters from loaded/imported data
     */
    setParameters(params) {
        Object.keys(params).forEach(param => {
            this.parameters.setParameter(param, params[param]);
        });
        this.updateParameters(params);
    }
    
    /**
     * Start the render loop
     */
    startRenderLoop() {
        if (window.mobileDebug) {
            window.mobileDebug.log(`🎬 Quantum Engine: Starting render loop with ${this.visualizers?.length} visualizers, isActive=${this.isActive}`);
        }
        
        const render = () => {
            if (this.isActive) {
                // CRITICAL FIX: Update visualizer parameters before rendering
                const currentParams = this.parameters.getAllParameters();
                
                this.visualizers.forEach(visualizer => {
                    if (visualizer.updateParameters && visualizer.render) {
                        visualizer.updateParameters(currentParams);
                        visualizer.render();
                    }
                });
                
                // Mobile debug: Log render activity periodically
                if (window.mobileDebug && !this._renderActivityLogged) {
                    window.mobileDebug.log(`🎬 Quantum Engine: Actively rendering ${this.visualizers?.length} visualizers`);
                    this._renderActivityLogged = true;
                }
            } else if (window.mobileDebug && !this._inactiveWarningLogged) {
                window.mobileDebug.log(`⚠️ Quantum Engine: Not rendering because isActive=false`);
                this._inactiveWarningLogged = true;
            }
            
            requestAnimationFrame(render);
        };
        
        render();
        console.log('🎬 Quantum render loop started');
        
        if (window.mobileDebug) {
            window.mobileDebug.log(`✅ Quantum Engine: Render loop started, will render when isActive=true`);
        }
    }
    
    /**
     * Update audio reactivity (for universal reactivity system)
     */
    updateAudioReactivity(audioData) {
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateAudio) {
                visualizer.updateAudio(audioData);
            }
        });
    }
    
    /**
     * Update click effects (for universal reactivity system)
     */
    updateClick(intensity) {
        this.visualizers.forEach(visualizer => {
            if (visualizer.triggerClick) {
                visualizer.triggerClick(0.5, 0.5, intensity); // Click at center with intensity
            }
        });
    }
    
    /**
     * Update scroll effects (for universal reactivity system)
     */
    updateScroll(velocity) {
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateScroll) {
                visualizer.updateScroll(velocity);
            }
        });
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Disconnect from universal reactivity
        if (window.universalReactivity) {
            window.universalReactivity.disconnectSystem('quantum');
        }
        
        this.visualizers.forEach(visualizer => {
            if (visualizer.destroy) {
                visualizer.destroy();
            }
        });
        this.visualizers = [];
        console.log('🧹 Quantum Engine destroyed');
    }
}