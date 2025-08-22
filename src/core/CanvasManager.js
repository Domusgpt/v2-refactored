/**
 * Smart Canvas Manager - Complete canvas lifecycle management
 * Destroys old canvases entirely and creates fresh ones for each system
 */

export class CanvasManager {
  constructor() {
    this.currentSystem = null;
    this.currentEngine = null;
  }

  async switchToSystem(systemName, engineClasses) {
    console.log(`🔄 Smart switching to ${systemName} - destroying old, creating fresh`);
    
    // STEP 1: Complete cleanup of current system
    await this.cleanupCurrentSystem();
    
    // STEP 2: Create fresh canvases for new system
    this.createFreshCanvases(systemName);
    
    // STEP 3: Load the correct engine for this system (always fresh)
    const engine = await this.loadEngine(systemName, engineClasses);
    
    // STEP 4: Start new engine
    if (engine && engine.setActive) {
      engine.setActive(true);
    }
    
    this.currentSystem = systemName;
    this.currentEngine = engine;
    console.log(`✅ Smart switched to ${systemName} - fresh canvases and engine`);
    return engine;
  }

  async cleanupCurrentSystem() {
    console.log('🧹 Complete cleanup of current system...');
    
    // Stop current engine
    if (this.currentEngine) {
      if (this.currentEngine.setActive) {
        this.currentEngine.setActive(false);
      }
      if (this.currentEngine.destroy) {
        this.currentEngine.destroy();
      }
    }
    
    // Destroy ALL canvases completely
    const allCanvases = document.querySelectorAll('canvas');
    allCanvases.forEach(canvas => {
      // Get WebGL context and lose it properly
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
      
      // Remove from DOM
      canvas.remove();
    });
    
    // Clear all layer containers
    const layerIds = ['vib34dLayers', 'quantumLayers', 'holographicLayers', 'polychoraLayers'];
    layerIds.forEach(layerId => {
      const container = document.getElementById(layerId);
      if (container) {
        container.innerHTML = ''; // Clear all children
        container.style.display = 'none';
      }
    });
    
    console.log('✅ Complete cleanup finished - all canvases destroyed');
  }

  createFreshCanvases(systemName) {
    console.log(`🎨 Creating fresh canvases for ${systemName}...`);
    
    // Get the target container
    const targetLayerId = systemName === 'faceted' ? 'vib34dLayers' : `${systemName}Layers`;
    const targetContainer = document.getElementById(targetLayerId);
    
    if (!targetContainer) {
      console.error(`❌ Container ${targetLayerId} not found`);
      return;
    }
    
    // Define canvas layers for each system
    const canvasConfigs = this.getCanvasConfigs(systemName);
    
    // Create fresh canvases
    canvasConfigs.forEach(config => {
      const canvas = document.createElement('canvas');
      canvas.id = config.id;
      canvas.className = 'visualization-layer';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = config.zIndex;
      canvas.style.pointerEvents = config.pointerEvents || 'none';
      
      // Smart canvas sizing
      const viewWidth = window.innerWidth;
      const viewHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = viewWidth * dpr;
      canvas.height = viewHeight * dpr;
      
      targetContainer.appendChild(canvas);
    });
    
    // Show the target container
    targetContainer.style.display = 'block';
    targetContainer.style.visibility = 'visible';
    targetContainer.style.opacity = '1';
    
    console.log(`✅ Created ${canvasConfigs.length} fresh canvases for ${systemName}`);
  }

  getCanvasConfigs(systemName) {
    const baseConfigs = [
      { id: 'background-canvas', zIndex: 1 },
      { id: 'shadow-canvas', zIndex: 2 },
      { id: 'content-canvas', zIndex: 3 },
      { id: 'highlight-canvas', zIndex: 4 },
      { id: 'accent-canvas', zIndex: 5 }
    ];
    
    // System-specific canvas ID patterns
    switch (systemName) {
      case 'faceted':
        return baseConfigs; // Use base IDs
        
      case 'quantum':
        return baseConfigs.map(config => ({
          ...config,
          id: `quantum-${config.id}`
        }));
        
      case 'holographic':
        return baseConfigs.map(config => ({
          ...config,
          id: `holo-${config.id}`
        }));
        
      case 'polychora':
        return baseConfigs.map(config => ({
          ...config,
          id: `polychora-${config.id}`
        }));
        
      default:
        return baseConfigs;
    }
  }
  
  async loadEngine(systemName, engineClasses) {
    console.log(`🚀 Creating FRESH ${systemName} engine - no reuse, smart system`);
    
    let engine = null;
    
    try {
      switch(systemName) {
        case 'faceted':
          if (engineClasses.VIB34DIntegratedEngine) {
            console.log('📦 Creating fresh VIB34DIntegratedEngine');
            engine = new engineClasses.VIB34DIntegratedEngine();
            window.engine = engine;
            console.log('✅ Fresh Faceted engine created');
          } else {
            console.error('❌ VIB34DIntegratedEngine class not found in engineClasses');
          }
          break;
          
        case 'quantum':
          if (engineClasses.QuantumEngine) {
            console.log('📦 Creating fresh QuantumEngine');
            engine = new engineClasses.QuantumEngine();
            window.quantumEngine = engine;
            console.log('✅ Fresh Quantum engine created');
          } else {
            console.error('❌ QuantumEngine class not found in engineClasses');
          }
          break;
          
        case 'holographic':
          if (engineClasses.RealHolographicSystem) {
            console.log('📦 Creating fresh RealHolographicSystem');
            engine = new engineClasses.RealHolographicSystem();
            window.holographicSystem = engine;
            console.log('✅ Fresh Holographic engine created');
          } else {
            console.error('❌ RealHolographicSystem class not found in engineClasses');
          }
          break;
          
        case 'polychora':
          if (engineClasses.PolychoraSystem) {
            console.log('📦 Creating fresh PolychoraSystem');
            engine = new engineClasses.PolychoraSystem();
            window.polychoraSystem = engine;
            console.log('✅ Fresh Polychora engine created');
          } else {
            console.error('❌ PolychoraSystem class not found in engineClasses');
          }
          break;
          
        default:
          console.error(`❌ Unknown system: ${systemName}`);
      }
      
      if (engine) {
        console.log(`✅ ${systemName} engine loaded successfully`);
      } else {
        console.error(`❌ Failed to load ${systemName} engine - no engine created`);
      }
      
    } catch (error) {
      console.error(`💥 Error creating ${systemName} engine:`, error);
      engine = null;
    }
    
    return engine;
  }
}