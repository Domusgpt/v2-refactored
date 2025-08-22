/**
 * Smart Canvas Manager - Clean system switching with proper engine lifecycle
 */

export class CanvasManager {
  constructor() {
    this.currentSystem = null;
    this.currentEngine = null;
    this.engines = new Map(); // Cache engines to avoid recreation issues
  }

  async switchToSystem(systemName, engineClasses) {
    console.log(`🔄 Switching to ${systemName}`);
    
    // STEP 1: Stop current engine cleanly
    if (this.currentEngine) {
      if (this.currentEngine.setActive) {
        this.currentEngine.setActive(false);
      }
      // Don't destroy - just deactivate for potential reuse
    }
    
    // STEP 2: Show new system layers and ensure canvas readiness
    this.showSystemLayers(systemName);
    this.ensureCanvasReadiness(systemName);
    
    // STEP 3: Get or create engine (with smart caching)
    const engine = await this.getOrCreateEngine(systemName, engineClasses);
    
    // STEP 4: Activate new engine
    if (engine) {
      if (engine.setActive) {
        engine.setActive(true);
      }
      // Force refresh/render to ensure visibility
      if (engine.startRenderLoop && !engine.animationId) {
        engine.startRenderLoop();
      }
    }
    
    this.currentSystem = systemName;
    this.currentEngine = engine;
    console.log(`✅ Switched to ${systemName}`);
    return engine;
  }
  
  async getOrCreateEngine(systemName, engineClasses) {
    console.log(`🚀 Getting or creating ${systemName} engine...`);
    
    // Check cache first
    if (this.engines.has(systemName)) {
      const cachedEngine = this.engines.get(systemName);
      if (cachedEngine && this.isEngineHealthy(cachedEngine)) {
        console.log(`♻️ Reusing healthy cached ${systemName} engine`);
        return cachedEngine;
      } else {
        console.log(`🔄 Cached ${systemName} engine unhealthy, creating new one`);
        this.engines.delete(systemName);
      }
    }
    
    // Create new engine
    let engine = null;
    
    try {
      switch(systemName) {
        case 'faceted':
          if (engineClasses.VIB34DIntegratedEngine) {
            console.log('📦 Creating fresh VIB34DIntegratedEngine...');
            engine = new engineClasses.VIB34DIntegratedEngine();
            window.engine = engine;
            console.log('✅ Faceted engine created');
          }
          break;
          
        case 'quantum':
          if (engineClasses.QuantumEngine) {
            console.log('📦 Creating fresh QuantumEngine...');
            engine = new engineClasses.QuantumEngine();
            window.quantumEngine = engine;
            console.log('✅ Quantum engine created');
          }
          break;
          
        case 'holographic':
          if (engineClasses.RealHolographicSystem) {
            console.log('📦 Creating fresh RealHolographicSystem...');
            engine = new engineClasses.RealHolographicSystem();
            window.holographicSystem = engine;
            console.log('✅ Holographic engine created');
          }
          break;
          
        case 'polychora':
          if (engineClasses.PolychoraSystem) {
            console.log('📦 Creating fresh PolychoraSystem...');
            engine = new engineClasses.PolychoraSystem();
            window.polychoraSystem = engine;
            console.log('✅ Polychora engine created');
          }
          break;
          
        default:
          console.error(`❌ Unknown system: ${systemName}`);
      }
      
      // Cache the new engine if successful
      if (engine) {
        this.engines.set(systemName, engine);
        console.log(`✅ ${systemName} engine cached`);
      }
      
    } catch (error) {
      console.error(`💥 Error creating ${systemName} engine:`, error);
      engine = null;
    }
    
    return engine;
  }

  // Check if engine is healthy (has visualizers and no WebGL errors)
  isEngineHealthy(engine) {
    if (!engine) return false;
    
    // Check for visualizers (basic health check)
    if (!engine.visualizers || engine.visualizers.length === 0) {
      return false;
    }
    
    // Check if visualizers have valid WebGL contexts
    const hasValidGL = engine.visualizers.some(vis => {
      return vis.gl && !vis.gl.isContextLost();
    });
    
    return hasValidGL;
  }

  // Ensure canvases are properly sized for the target system
  ensureCanvasReadiness(systemName) {
    const layerIds = {
      faceted: 'vib34dLayers',
      quantum: 'quantumLayers', 
      holographic: 'holographicLayers',
      polychora: 'polychoraLayers'
    };
    
    const targetContainer = document.getElementById(layerIds[systemName]);
    if (targetContainer) {
      // Make sure all canvases in this container are properly sized
      const canvases = targetContainer.querySelectorAll('canvas');
      if (window.smartCanvasManager) {
        // Use our simple canvas manager to size these canvases
        canvases.forEach(canvas => {
          const viewWidth = window.innerWidth;
          const viewHeight = window.innerHeight;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          
          canvas.style.position = 'absolute';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          
          canvas.width = viewWidth * dpr;
          canvas.height = viewHeight * dpr;
        });
        console.log(`📐 Ensured ${canvases.length} canvases ready for ${systemName}`);
      }
    }
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