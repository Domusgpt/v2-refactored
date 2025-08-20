/**
 * VIB34D Integrated Holographic Engine
 * Main system controller combining 5-layer holographic rendering
 * with 4D polytopal mathematics and 100 geometric variations
 */

import { IntegratedHolographicVisualizer } from './Visualizer.js';
import { ParameterManager } from './Parameters.js';
import { VariationManager } from '../variations/VariationManager.js';
import { GallerySystem } from '../gallery/GallerySystem.js';
import { ExportManager } from '../export/ExportManager.js';
import { InteractionHandler } from '../utils/InteractionHandler.js';
import { StatusManager } from '../ui/StatusManager.js';

export class VIB34DIntegratedEngine {
    constructor() {
        // Core system components
        this.visualizers = [];
        this.parameterManager = new ParameterManager();
        this.variationManager = new VariationManager(this); // CRITICAL FIX: Pass this as engine parameter
        this.gallerySystem = new GallerySystem(this);
        this.exportManager = new ExportManager(this);
        this.interactionHandler = new InteractionHandler(this);
        this.statusManager = new StatusManager();
        
        // Current state
        this.currentVariation = 0;
        this.totalVariations = 100; // 30 default + 70 custom
        
        // Mouse interaction state
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        
        // Animation state
        this.time = 0;
        this.animationId = null;
        
        // Initialize system
        this.init();
    }
    
    /**
     * Initialize the complete VIB34D system
     */
    init() {
        console.log('🌌 Initializing VIB34D Integrated Holographic Engine...');
        
        try {
            this.createVisualizers();
            this.setupControls();
            this.setupInteractions();
            this.loadCustomVariations();
            this.populateVariationGrid();
            this.startRenderLoop();
            
            this.statusManager.setStatus('VIB34D Engine initialized successfully', 'success');
            console.log('✅ VIB34D Engine ready');
        } catch (error) {
            console.error('❌ Failed to initialize VIB34D Engine:', error);
            this.statusManager.setStatus('Initialization failed: ' + error.message, 'error');
        }
    }
    
    /**
     * Create the 5-layer holographic visualization system
     */
    createVisualizers() {
        const layers = [
            { id: 'background-canvas', role: 'background', reactivity: 0.5 },
            { id: 'shadow-canvas', role: 'shadow', reactivity: 0.7 },
            { id: 'content-canvas', role: 'content', reactivity: 0.9 },
            { id: 'highlight-canvas', role: 'highlight', reactivity: 1.1 },
            { id: 'accent-canvas', role: 'accent', reactivity: 1.5 }
        ];
        
        layers.forEach(layer => {
            const visualizer = new IntegratedHolographicVisualizer(
                layer.id, 
                layer.role, 
                layer.reactivity, 
                this.currentVariation
            );
            this.visualizers.push(visualizer);
        });
        
        console.log('✅ Created 5-layer integrated holographic system');
    }
    
    /**
     * Set up UI controls and event handlers
     */
    setupControls() {
        // Delegate to UI components
        this.setupTabSystem();
        this.setupParameterControls();
        this.setupGeometryPresets();
        this.updateDisplayValues();
    }
    
    setupTabSystem() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
            });
        });
    }
    
    setupParameterControls() {
        const controls = [
            'variationSlider', 'rot4dXW', 'rot4dYW', 'rot4dZW', 'dimension',
            'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue'
        ];
        
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateFromControls());
            }
        });
    }
    
    setupGeometryPresets() {
        document.querySelectorAll('[data-geometry]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-geometry]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.parameterManager.setGeometry(parseInt(btn.dataset.geometry));
                this.updateVisualizers();
                this.updateDisplayValues();
            });
        });
    }
    
    /**
     * Set up mouse/touch interactions
     */
    setupInteractions() {
        this.interactionHandler.setupMouseTracking();
        this.interactionHandler.setupClickHandling();
        this.interactionHandler.setupTouchSupport();
    }
    
    /**
     * Load custom variations from storage
     */
    loadCustomVariations() {
        this.variationManager.loadCustomVariations();
    }
    
    /**
     * Populate the variation grid UI
     */
    populateVariationGrid() {
        this.variationManager.populateGrid();
    }
    
    /**
     * Start the main render loop
     */
    startRenderLoop() {
        if (window.mobileDebug) {
            window.mobileDebug.log(`🎬 VIB34D Faceted Engine: Starting render loop with ${this.visualizers?.length} visualizers`);
        }
        
        const render = () => {
            this.time += 0.016; // ~60fps
            this.updateVisualizers();
            this.animationId = requestAnimationFrame(render);
        };
        render();
        
        // Log successful start
        if (window.mobileDebug) {
            window.mobileDebug.log(`✅ VIB34D Faceted Engine: Render loop started, animationId=${!!this.animationId}`);
        }
    }
    
    /**
     * Update all visualizers with current parameters
     */
    updateVisualizers() {
        const params = this.parameterManager.getAllParameters();
        
        // Add interaction state
        params.mouseX = this.mouseX;
        params.mouseY = this.mouseY;
        params.mouseIntensity = this.mouseIntensity;
        params.clickIntensity = this.clickIntensity;
        params.time = this.time;
        
        this.visualizers.forEach(visualizer => {
            visualizer.updateParameters(params);
            visualizer.render();
        });
        
        // Decay interaction intensities
        this.mouseIntensity *= 0.95;
        this.clickIntensity *= 0.92;
    }
    
    /**
     * Update parameters from UI controls
     */
    updateFromControls() {
        this.parameterManager.updateFromControls();
        this.updateDisplayValues();
    }
    
    /**
     * Update display values in UI
     */
    updateDisplayValues() {
        this.parameterManager.updateDisplayValues();
    }
    
    /**
     * Navigate to specific variation
     */
    setVariation(index) {
        if (index >= 0 && index < this.totalVariations) {
            this.currentVariation = index;
            this.variationManager.applyVariation(index);
            this.updateDisplayValues();
            this.updateVisualizers();
            
            // Update UI
            const slider = document.getElementById('variationSlider');
            if (slider) {
                slider.value = index;
            }
            
            this.statusManager.setStatus(`Variation ${index + 1} loaded`, 'info');
        }
    }
    
    /**
     * Navigation methods
     */
    nextVariation() {
        this.setVariation((this.currentVariation + 1) % this.totalVariations);
    }
    
    previousVariation() {
        this.setVariation((this.currentVariation - 1 + this.totalVariations) % this.totalVariations);
    }
    
    randomVariation() {
        const newIndex = Math.floor(Math.random() * this.totalVariations);
        this.setVariation(newIndex);
    }
    
    /**
     * Randomize all parameters
     */
    randomizeAll() {
        this.parameterManager.randomizeAll();
        this.updateDisplayValues();
        this.updateVisualizers();
        this.statusManager.setStatus('All parameters randomized', 'info');
    }
    
    /**
     * Reset to default parameters
     */
    resetToDefaults() {
        this.parameterManager.resetToDefaults();
        this.updateDisplayValues();
        this.updateVisualizers();
        this.statusManager.setStatus('Reset to default parameters', 'info');
    }
    
    /**
     * Save current state as custom variation
     */
    saveAsCustomVariation() {
        const customIndex = this.variationManager.saveCurrentAsCustom();
        if (customIndex !== -1) {
            this.statusManager.setStatus(`Saved as custom variation ${customIndex + 1}`, 'success');
            this.populateVariationGrid();
        } else {
            this.statusManager.setStatus('All custom slots are full', 'warning');
        }
    }
    
    /**
     * Open gallery view
     */
    openGalleryView() {
        this.gallerySystem.openGallery();
    }
    
    /**
     * Export methods
     */
    exportJSON() {
        this.exportManager.exportJSON();
    }
    
    exportCSS() {
        this.exportManager.exportCSS();
    }
    
    exportHTML() {
        this.exportManager.exportHTML();
    }
    
    exportPNG() {
        this.exportManager.exportPNG();
    }
    
    /**
     * Import methods
     */
    importJSON() {
        this.exportManager.importJSON();
    }
    
    importFolder() {
        this.exportManager.importFolder();
    }
    
    /**
     * Update mouse interaction state
     */
    updateMouseState(x, y, intensity = 0.5) {
        this.mouseX = x;
        this.mouseY = y;
        this.mouseIntensity = intensity;
    }
    
    /**
     * Trigger click interaction
     */
    triggerClick(intensity = 1.0) {
        this.clickIntensity = intensity;
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
        
        // Apply audio data to parameter modulation
        if (audioData.energy > 0.3) {
            // Temporarily boost intensity based on audio energy
            this.parameterManager.setParameter('intensity', Math.min(1.0, 0.5 + audioData.energy * 0.5));
        }
        
        if (audioData.bass > 0.4) {
            // Temporarily boost grid density on bass hits
            const currentDensity = this.parameterManager.getParameter('gridDensity') || 15;
            this.parameterManager.setParameter('gridDensity', Math.min(100, currentDensity + audioData.bass * 20));
        }
    }
    
    /**
     * Update click effects (for universal reactivity system)
     */
    updateClick(intensity) {
        // Trigger click intensity on all visualizers
        this.clickIntensity = Math.min(1.0, this.clickIntensity + intensity);
        
        this.visualizers.forEach(visualizer => {
            if (visualizer.triggerClick) {
                visualizer.triggerClick(intensity);
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
        
        // Apply scroll to parameter modulation
        const scrollIntensity = Math.abs(velocity);
        if (scrollIntensity > 0.1) {
            // Temporarily adjust morph factor based on scroll
            const currentMorph = this.parameterManager.getParameter('morphFactor') || 1.0;
            this.parameterManager.setParameter('morphFactor', Math.max(0.1, currentMorph + velocity * 0.5));
        }
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        // Disconnect from universal reactivity
        if (window.universalReactivity) {
            window.universalReactivity.disconnectSystem('faceted');
        }
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.visualizers.forEach(visualizer => {
            if (visualizer.destroy) {
                visualizer.destroy();
            }
        });
        
        console.log('🔄 VIB34D Engine destroyed');
    }
}