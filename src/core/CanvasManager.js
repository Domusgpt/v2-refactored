/**
 * Simple Canvas Manager - Destroy old, create new
 * Just makes tab switching work without crashing
 */

export class CanvasManager {
  constructor() {
    this.currentSystem = null;
    this.canvasConfigs = {
      faceted: [
        'background-canvas', 'shadow-canvas', 'content-canvas', 'highlight-canvas', 'accent-canvas'
      ],
      quantum: [
        'quantum-background-canvas', 'quantum-shadow-canvas', 'quantum-content-canvas', 'quantum-highlight-canvas', 'quantum-accent-canvas'
      ],
      holographic: [
        'holo-background-canvas', 'holo-shadow-canvas', 'holo-content-canvas', 'holo-highlight-canvas', 'holo-accent-canvas'
      ],
      polychora: [
        'polychora-background-canvas', 'polychora-shadow-canvas', 'polychora-content-canvas', 'polychora-highlight-canvas', 'polychora-accent-canvas'
      ]
    };
  }

  async switchToSystem(systemName, engineClasses) {
    console.log(`🔄 Switching to ${systemName}`);
    
    // STEP 1: Destroy old visualizer canvases
    if (this.currentSystem && this.currentSystem !== systemName) {
      this.destroySystemCanvases(this.currentSystem);
    }
    
    // STEP 2: Show new system layers
    this.showSystemLayers(systemName);
    
    // STEP 3: Create new visualizer canvases
    this.createSystemCanvases(systemName);
    
    // STEP 4: Load the correct engine for this system
    const engine = await this.loadEngine(systemName, engineClasses);
    
    this.currentSystem = systemName;
    console.log(`✅ Switched to ${systemName}`);
    return engine;
  }
  
  async loadEngine(systemName, engineClasses) {
    console.log(`🚀 Loading ${systemName} engine...`);
    
    let engine = null;
    
    switch(systemName) {
      case 'faceted':
        if (engineClasses.VIB34DIntegratedEngine) {
          engine = new engineClasses.VIB34DIntegratedEngine();
          window.engine = engine;
        }
        break;
        
      case 'quantum':
        if (engineClasses.QuantumEngine) {
          engine = new engineClasses.QuantumEngine();
          window.quantumEngine = engine;
        }
        break;
        
      case 'holographic':
        if (engineClasses.RealHolographicSystem) {
          engine = new engineClasses.RealHolographicSystem();
          window.holographicSystem = engine;
        }
        break;
        
      case 'polychora':
        if (engineClasses.PolychoraSystem) {
          engine = new engineClasses.PolychoraSystem();
          window.polychoraSystem = engine;
        }
        break;
    }
    
    if (engine) {
      console.log(`✅ ${systemName} engine loaded`);
    } else {
      console.error(`❌ Failed to load ${systemName} engine`);
    }
    
    return engine;
  }

  destroySystemCanvases(systemName) {
    const canvasIds = this.canvasConfigs[systemName];
    if (!canvasIds) return;
    
    console.log(`🧽 Destroying ${canvasIds.length} canvases for ${systemName}`);
    
    canvasIds.forEach(canvasId => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        // Get context and lose it properly
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) {
            ext.loseContext();
          }
        }
        
        // Clear canvas
        canvas.width = 1;
        canvas.height = 1;
        console.log(`✨ Destroyed canvas: ${canvasId}`);
      }
    });
  }

  createSystemCanvases(systemName) {
    const canvasIds = this.canvasConfigs[systemName];
    if (!canvasIds) return;
    
    console.log(`🎨 Creating ${canvasIds.length} canvases for ${systemName}`);
    
    canvasIds.forEach(canvasId => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        // Set proper canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Create WebGL context
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          console.log(`✨ Created canvas: ${canvasId}`);
        }
      }
    });
  }

  showSystemLayers(systemName) {
    // Hide all layer containers
    const layerIds = ['vib34dLayers', 'quantumLayers', 'holographicLayers', 'polychoraLayers'];
    layerIds.forEach(layerId => {
      const container = document.getElementById(layerId);
      if (container) {
        container.style.display = 'none';
      }
    });
    
    // Show target system layer
    const targetLayerId = systemName === 'faceted' ? 'vib34dLayers' : `${systemName}Layers`;
    const targetContainer = document.getElementById(targetLayerId);
    if (targetContainer) {
      targetContainer.style.display = 'block';
      targetContainer.style.visibility = 'visible';
      targetContainer.style.opacity = '1';
    }
  }
}