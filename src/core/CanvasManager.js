/**
 * Simple Canvas Manager - System switching only
 * Just handles layer visibility and engine loading
 */

export class CanvasManager {
  constructor() {
    this.currentSystem = null;
    this.currentEngine = null;
  }

  async switchToSystem(systemName, engineClasses) {
    console.log(`🔄 Switching to ${systemName}`);
    
    // STEP 1: Stop current engine
    if (this.currentEngine && this.currentEngine.setActive) {
      this.currentEngine.setActive(false);
    }
    
    // STEP 2: Show new system layers
    this.showSystemLayers(systemName);
    
    // STEP 3: Load the correct engine for this system
    const engine = await this.loadEngine(systemName, engineClasses);
    
    // STEP 4: Start new engine
    if (engine && engine.setActive) {
      engine.setActive(true);
    }
    
    this.currentSystem = systemName;
    this.currentEngine = engine;
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