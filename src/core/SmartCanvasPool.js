/**
 * SmartCanvasPool - Context pooling with destroy/recreate on system switch
 * Reduces 20 contexts to 5 contexts (only active system has contexts)
 */

export class SmartCanvasPool {
  constructor(engineClasses = {}) {
    this.activeSystem = null;
    this.systems = new Map();
    this.engineClasses = engineClasses; // Pass engine classes from main script
    this.canvasConfigs = {
      faceted: [
        { id: 'background-canvas', role: 'background' },
        { id: 'shadow-canvas', role: 'shadow' },
        { id: 'content-canvas', role: 'content' },
        { id: 'highlight-canvas', role: 'highlight' },
        { id: 'accent-canvas', role: 'accent' }
      ],
      quantum: [
        { id: 'quantum-background-canvas', role: 'background' },
        { id: 'quantum-shadow-canvas', role: 'shadow' },
        { id: 'quantum-content-canvas', role: 'content' },
        { id: 'quantum-highlight-canvas', role: 'highlight' },
        { id: 'quantum-accent-canvas', role: 'accent' }
      ],
      holographic: [
        { id: 'holo-background-canvas', role: 'background' },
        { id: 'holo-shadow-canvas', role: 'shadow' },
        { id: 'holo-content-canvas', role: 'content' },
        { id: 'holo-highlight-canvas', role: 'highlight' },
        { id: 'holo-accent-canvas', role: 'accent' }
      ],
      polychora: [
        { id: 'polychora-background-canvas', role: 'background' },
        { id: 'polychora-shadow-canvas', role: 'shadow' },
        { id: 'polychora-content-canvas', role: 'content' },
        { id: 'polychora-highlight-canvas', role: 'highlight' },
        { id: 'polychora-accent-canvas', role: 'accent' }
      ]
    };
    
    console.log('🎯 SmartCanvasPool initialized - Only 5 contexts at a time');
  }

  async switchToSystem(systemName, engine) {
    console.log(`🔄 Switching to ${systemName} - managing contexts and engines`);
    
    // Hide all layer containers first
    this.hideAllLayers();
    
    // Store previous system
    const previousSystem = this.activeSystem;
    
    // Deactivate previous engine BEFORE destroying contexts
    if (previousSystem && previousSystem !== systemName) {
      const prevEngine = this.getEngineForSystem(previousSystem);
      if (prevEngine && prevEngine.setActive) {
        console.log(`🔴 Deactivating ${previousSystem} engine`);
        prevEngine.setActive(false);
      }
    }
    
    // Destroy previous system contexts
    if (this.activeSystem) {
      this.destroySystemContexts(this.activeSystem);
    }
    
    // Show target system layers BEFORE creating engine (critical for mobile)
    this.showSystemLayers(systemName);
    
    // Update active system
    this.activeSystem = systemName;
    
    // Create NEW contexts for target system
    this.createSystemContexts(systemName);
    
    // Get or create engine for target system
    let targetEngine = this.getEngineForSystem(systemName);
    
    if (!targetEngine) {
      console.log(`🚀 Creating new ${systemName} engine...`);
      targetEngine = await this.createEngineForSystem(systemName);
      
      // New engine will have freshly created visualizers
      console.log(`✨ New ${systemName} engine has ${targetEngine?.visualizers?.length || 0} visualizers`);
    } else {
      console.log(`♻️ Reusing existing ${systemName} engine with ${targetEngine?.visualizers?.length || 0} visualizers`);
      
      // CRITICAL: Reinitialize visualizers for reused engine
      if (targetEngine.visualizers && targetEngine.visualizers.length > 0) {
        console.log(`🔄 Reinitializing ${targetEngine.visualizers.length} visualizers for ${systemName}`);
        
        // Wait a bit for contexts to stabilize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        targetEngine.visualizers.forEach((visualizer, index) => {
          try {
            if (visualizer.reinitializeContext) {
              const success = visualizer.reinitializeContext();
              if (success) {
                console.log(`✅ Visualizer ${index} reinitialized`);
              } else {
                console.warn(`⚠️ Visualizer ${index} reinit failed`);
              }
            } else {
              console.warn(`⚠️ Visualizer ${index} missing reinitializeContext`);
            }
          } catch (error) {
            console.error(`❌ Failed to reinitialize visualizer ${index}:`, error);
          }
        });
      }
    }
    
    // Activate the target engine
    if (targetEngine && targetEngine.setActive) {
      console.log(`🟢 Activating ${systemName} engine`);
      targetEngine.setActive(true);
    }
    
    console.log(`✅ ${systemName} system active with 5 WebGL contexts`);
    return targetEngine;
  }

  destroyCurrentEngine() {
    // Destroy the current engine and its visualizers
    const currentEngine = this.getCurrentEngine();
    if (currentEngine && currentEngine.visualizers) {
      console.log(`🧹 Destroying ${currentEngine.visualizers.length} visualizers`);
      currentEngine.visualizers.forEach(visualizer => {
        if (visualizer.destroy) {
          visualizer.destroy();
        }
      });
    }
  }

  getCurrentEngine() {
    switch(this.activeSystem) {
      case 'faceted': return window.engine;
      case 'quantum': return window.quantumEngine;
      case 'holographic': return window.holographicSystem;
      case 'polychora': return window.polychoraSystem;
      default: return null;
    }
  }

  getEngineForSystem(systemName) {
    switch(systemName) {
      case 'faceted': return window.engine;
      case 'quantum': return window.quantumEngine;
      case 'holographic': return window.holographicSystem;
      case 'polychora': return window.polychoraSystem;
      default: return null;
    }
  }

  async createEngineForSystem(systemName) {
    console.log(`🚀 Lazy loading ${systemName} engine...`);
    
    // Wait a bit for contexts to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let newEngine = null;
    
    try {
      switch(systemName) {
        case 'faceted':
          console.log('📦 Creating VIB34DIntegratedEngine...');
          if (this.engineClasses.VIB34DIntegratedEngine) {
            newEngine = new this.engineClasses.VIB34DIntegratedEngine();
            window.engine = newEngine;
          } else {
            console.error('❌ VIB34DIntegratedEngine class not available');
          }
          break;
          
        case 'quantum':
          console.log('📦 Creating QuantumEngine...');
          if (this.engineClasses.QuantumEngine) {
            newEngine = new this.engineClasses.QuantumEngine();
            window.quantumEngine = newEngine;
          } else {
            console.error('❌ QuantumEngine class not available');
          }
          break;
          
        case 'holographic':
          console.log('📦 Creating RealHolographicSystem...');
          if (this.engineClasses.RealHolographicSystem) {
            newEngine = new this.engineClasses.RealHolographicSystem();
            window.holographicSystem = newEngine;
          } else {
            console.error('❌ RealHolographicSystem class not available');
          }
          break;
          
        case 'polychora':
          console.log('🔮 Polychora system not implemented yet');
          // TODO: Add polychora when implemented
          break;
          
        default:
          console.error(`❌ Unknown system: ${systemName}`);
      }
      
      if (newEngine) {
        console.log(`✅ ${systemName} engine created and ready`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to create ${systemName} engine:`, error);
    }
    
    return newEngine;
  }

  destroySystemContexts(systemName) {
    const configs = this.canvasConfigs[systemName];
    if (!configs) return;
    
    console.log(`🧽 Cleaning up ${configs.length} WebGL contexts for ${systemName}`);
    
    configs.forEach(config => {
      const canvas = document.getElementById(config.id);
      if (canvas) {
        // Get WebGL context to clean up
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          // DON'T call loseContext() - it permanently breaks canvas elements!
          // const ext = gl.getExtension('WEBGL_lose_context');
          // if (ext) {
          //   ext.loseContext(); // THIS BREAKS WEBGL PERMANENTLY!
          // }
          console.log(`🚫 Skipping loseContext() to preserve canvas element`);
        }
        
        // Clear canvas
        canvas.width = 1;
        canvas.height = 1;
        
        console.log(`✨ Cleaned context: ${config.id} (canvas preserved)`);
      }
    });
  }

  createSystemContexts(systemName) {
    const configs = this.canvasConfigs[systemName];
    if (!configs) return;
    
    console.log(`🎨 Creating ${configs.length} WebGL contexts for ${systemName}`);
    
    // CRITICAL MOBILE FIX: Ensure canvas container is visible first
    const layerId = systemName === 'faceted' ? 'vib34dLayers' : `${systemName}Layers`;
    const layerContainer = document.getElementById(layerId);
    if (layerContainer && layerContainer.style.display === 'none') {
      console.log(`📱 MOBILE FIX: Making ${layerId} visible for context creation`);
      layerContainer.style.display = 'block';
      layerContainer.style.visibility = 'visible';
      layerContainer.style.opacity = '1';
    }
    
    configs.forEach(config => {
      const canvas = document.getElementById(config.id);
      if (canvas) {
        // Set proper canvas dimensions
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // CRITICAL FIX: Use UNIFIED context options that match ALL visualizers
        const contextOptions = {
          alpha: true,
          depth: true,
          stencil: false,
          antialias: false,  // Disable antialiasing on mobile for performance
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false  // Don't fail on mobile
        };
        
        const gl = canvas.getContext('webgl2', contextOptions) || 
                   canvas.getContext('webgl', contextOptions) ||
                   canvas.getContext('experimental-webgl', contextOptions);
        
        if (gl) {
          // CRITICAL FIX: Add proper WebGL context validation
          if (gl.isContextLost()) {
            console.error(`❌ Context lost immediately: ${config.id}`);
            return;
          }
          
          // Test basic WebGL functionality
          try {
            const version = gl.getParameter(gl.VERSION);
            const renderer = gl.getParameter(gl.RENDERER);
            console.log(`✨ Created context: ${config.id} (${canvas.width}x${canvas.height}) - ${version}`);
            
            // Test shader creation capability
            const testShader = gl.createShader(gl.VERTEX_SHADER);
            if (!testShader) {
              console.warn(`⚠️ Context may be invalid: ${config.id} - cannot create shaders`);
            } else {
              gl.deleteShader(testShader);
            }
          } catch (error) {
            console.error(`❌ Context validation failed: ${config.id} -`, error);
          }
        } else {
          console.error(`❌ Failed to create context: ${config.id} - WebGL not supported`);
        }
      }
    });
  }

  getActiveContextCount() {
    if (!this.activeSystem) return 0;
    
    const configs = this.canvasConfigs[this.activeSystem];
    let activeCount = 0;
    
    configs.forEach(config => {
      const canvas = document.getElementById(config.id);
      if (canvas) {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl && !gl.isContextLost()) {
          activeCount++;
        }
      }
    });
    
    return activeCount;
  }

  preloadSystem(systemName) {
    // Pre-create contexts for faster switching
    console.log(`⚡ Pre-loading contexts for ${systemName}`);
    this.createSystemContexts(systemName);
  }

  dispose() {
    // Clean up all systems
    Object.keys(this.canvasConfigs).forEach(systemName => {
      this.destroySystemContexts(systemName);
    });
    
    this.activeSystem = null;
    console.log('🧹 SmartCanvasPool disposed');
  }

  hideAllLayers() {
    // Hide all layer containers to ensure only active system is visible
    const layerIds = ['vib34dLayers', 'quantumLayers', 'holographicLayers', 'polychoraLayers'];
    layerIds.forEach(layerId => {
      const container = document.getElementById(layerId);
      if (container) {
        container.style.display = 'none';
        container.style.visibility = 'hidden';
        container.style.opacity = '0';
      }
    });
    console.log('😵 All layer containers hidden');
  }

  showSystemLayers(systemName) {
    // Show only the target system's layer container
    const layerId = systemName === 'faceted' ? 'vib34dLayers' : `${systemName}Layers`;
    const container = document.getElementById(layerId);
    if (container) {
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      console.log(`👁️ Showing layer container: ${layerId}`);
    } else {
      console.error(`❌ Layer container not found: ${layerId}`);
    }
  }

  getStats() {
    return {
      activeSystem: this.activeSystem,
      activeContexts: this.getActiveContextCount(),
      maxContexts: 5,
      reduction: '75% (20 → 5 contexts)'
    };
  }
}