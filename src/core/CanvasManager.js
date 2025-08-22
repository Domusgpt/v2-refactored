/**
 * Dead Simple Canvas Manager - Just hide/show containers + fresh engines
 * No canvas destruction - HTML canvases stay put, just switch visibility
 */

export class CanvasManager {
  constructor() {
    this.currentSystem = null;
    this.currentEngine = null;
  }

  async switchToSystem(systemName, engineClasses) {
    console.log(`🔄 DESTROY OLD → CREATE NEW: ${systemName}`);
    
    // STEP 1: DESTROY current engine completely
    if (this.currentEngine) {
      if (this.currentEngine.setActive) {
        this.currentEngine.setActive(false);
      }
      if (this.currentEngine.destroy) {
        this.currentEngine.destroy();
      }
      console.log('💥 Old engine destroyed');
    }
    
    // STEP 2: DESTROY old WebGL contexts 
    this.destroyOldWebGLContexts();
    
    // STEP 3: Show new container
    this.switchContainerVisibility(systemName);
    
    // STEP 4: CREATE fresh engine
    const engine = await this.createFreshEngine(systemName, engineClasses);
    
    // STEP 5: Start new engine
    if (engine && engine.setActive) {
      engine.setActive(true);
    }
    
    this.currentSystem = systemName;
    this.currentEngine = engine;
    console.log(`✅ DESTROY → CREATE complete: ${systemName} ready`);
    return engine;
  }

  destroyOldWebGLContexts() {
    console.log('💥 COMPLETE DESTRUCTION: WebGL contexts + old system cleanup...');
    
    // STEP 1: Kill all WebGL contexts first
    const allCanvases = document.querySelectorAll('canvas');
    let destroyedCount = 0;
    
    allCanvases.forEach(canvas => {
      // Get any existing WebGL context
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        // Force context loss
        const loseContextExt = gl.getExtension('WEBGL_lose_context');
        if (loseContextExt) {
          loseContextExt.loseContext();
          destroyedCount++;
        }
      }
    });
    
    // STEP 2: Clear all global engine references (old system cleanup)
    if (window.engine) {
      console.log('💥 Clearing window.engine');
      window.engine = null;
    }
    if (window.quantumEngine) {
      console.log('💥 Clearing window.quantumEngine');
      window.quantumEngine = null;
    }
    if (window.holographicSystem) {
      console.log('💥 Clearing window.holographicSystem');
      window.holographicSystem = null;
    }
    if (window.polychoraSystem) {
      console.log('💥 Clearing window.polychoraSystem');
      window.polychoraSystem = null;
    }
    
    console.log(`💥 DESTRUCTION COMPLETE: ${destroyedCount} WebGL contexts destroyed, all engine refs cleared`);
  }

  switchContainerVisibility(systemName) {
    // Hide all containers
    const containers = ['vib34dLayers', 'quantumLayers', 'holographicLayers', 'polychoraLayers'];
    containers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.display = 'none';
      }
    });
    
    // Show target container
    const targetId = systemName === 'faceted' ? 'vib34dLayers' : `${systemName}Layers`;
    const targetContainer = document.getElementById(targetId);
    if (targetContainer) {
      targetContainer.style.display = 'block';
      targetContainer.style.visibility = 'visible';
      targetContainer.style.opacity = '1';
      console.log(`👁️ Showing ${systemName} container with ${targetContainer.querySelectorAll('canvas').length} canvases`);
    } else {
      console.error(`❌ Container ${targetId} not found`);
    }
  }
  
  async createFreshEngine(systemName, engineClasses) {
    console.log(`🚀 Creating fresh ${systemName} engine`);
    
    let engine = null;
    
    try {
      switch(systemName) {
        case 'faceted':
          if (engineClasses.VIB34DIntegratedEngine) {
            engine = new engineClasses.VIB34DIntegratedEngine();
            window.engine = engine;
            console.log('✅ Fresh Faceted engine');
          }
          break;
          
        case 'quantum':
          if (engineClasses.QuantumEngine) {
            engine = new engineClasses.QuantumEngine();
            window.quantumEngine = engine;
            console.log('✅ Fresh Quantum engine');
          }
          break;
          
        case 'holographic':
          if (engineClasses.RealHolographicSystem) {
            engine = new engineClasses.RealHolographicSystem();
            window.holographicSystem = engine;
            console.log('✅ Fresh Holographic engine');
          }
          break;
          
        case 'polychora':
          if (engineClasses.PolychoraSystem) {
            engine = new engineClasses.PolychoraSystem();
            window.polychoraSystem = engine;
            console.log('✅ Fresh Polychora engine');
          }
          break;
          
        default:
          console.error(`❌ Unknown system: ${systemName}`);
      }
      
    } catch (error) {
      console.error(`💥 Engine creation failed for ${systemName}:`, error);
      engine = null;
    }
    
    return engine;
  }
}