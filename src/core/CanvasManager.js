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
    
    try {
      switch(systemName) {
        case 'faceted':
          // Check if engine already exists and is working
          if (window.engine && window.engine.visualizers && window.engine.visualizers.length > 0) {
            console.log('♻️ Reusing existing Faceted engine');
            engine = window.engine;
          } else if (engineClasses.VIB34DIntegratedEngine) {
            console.log('📦 Creating VIB34DIntegratedEngine...');
            engine = new engineClasses.VIB34DIntegratedEngine();
            window.engine = engine;
            console.log('✅ Faceted engine created and stored in window.engine');
          } else {
            console.error('❌ VIB34DIntegratedEngine class not found in engineClasses');
          }
          break;
          
        case 'quantum':
          // Check if engine already exists and is working
          if (window.quantumEngine && window.quantumEngine.visualizers && window.quantumEngine.visualizers.length > 0) {
            console.log('♻️ Reusing existing Quantum engine');
            engine = window.quantumEngine;
          } else if (engineClasses.QuantumEngine) {
            console.log('📦 Creating QuantumEngine...');
            engine = new engineClasses.QuantumEngine();
            window.quantumEngine = engine;
            console.log('✅ Quantum engine created and stored in window.quantumEngine');
          } else {
            console.error('❌ QuantumEngine class not found in engineClasses');
          }
          break;
          
        case 'holographic':
          // Check if engine already exists and is working
          if (window.holographicSystem && window.holographicSystem.visualizers && window.holographicSystem.visualizers.length > 0) {
            console.log('♻️ Reusing existing Holographic engine');
            engine = window.holographicSystem;
          } else if (engineClasses.RealHolographicSystem) {
            console.log('📦 Creating RealHolographicSystem...');
            engine = new engineClasses.RealHolographicSystem();
            window.holographicSystem = engine;
            console.log('✅ Holographic engine created and stored in window.holographicSystem');
          } else {
            console.error('❌ RealHolographicSystem class not found in engineClasses');
          }
          break;
          
        case 'polychora':
          // Check if engine already exists and is working
          if (window.polychoraSystem && window.polychoraSystem.visualizers && window.polychoraSystem.visualizers.length > 0) {
            console.log('♻️ Reusing existing Polychora engine');
            engine = window.polychoraSystem;
          } else if (engineClasses.PolychoraSystem) {
            console.log('📦 Creating PolychoraSystem...');
            engine = new engineClasses.PolychoraSystem();
            window.polychoraSystem = engine;
            console.log('✅ Polychora engine created and stored in window.polychoraSystem');
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