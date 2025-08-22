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
    
    // If we're already on this system, just activate it
    if (this.activeSystem === systemName) {
      console.log(`✅ Already on ${systemName} - just activating engine`);
      this.showSystemLayers(systemName);
      const currentEngine = this.getEngineForSystem(systemName);
      if (currentEngine && currentEngine.setActive) {
        currentEngine.setActive(true);
      }
      return currentEngine;
    }
    
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
    
    // Destroy previous system contexts (but NOT the target system!)
    if (this.activeSystem && this.activeSystem !== systemName) {
      this.destroySystemContexts(this.activeSystem);
    }
    
    // Show target system layers BEFORE creating engine (critical for mobile)
    this.showSystemLayers(systemName);
    
    // Update active system
    this.activeSystem = systemName;
    
    // Create contexts for target system (only if needed)
    const existingContexts = this.countSystemContexts(systemName);
    if (existingContexts === 0) {
      console.log(`🆕 Creating contexts for ${systemName} (none exist)`);
      await this.createSystemContexts(systemName);
    } else {
      console.log(`♻️ Reusing existing ${existingContexts} contexts for ${systemName}`);
    }
    
    // CRITICAL: Validate contexts are working before creating engine
    const contextValidation = this.validateSystemContexts(systemName);
    if (!contextValidation.success) {
      console.error(`❌ Context validation failed for ${systemName}: ${contextValidation.error}`);
      return null;
    }
    console.log(`✅ Context validation passed for ${systemName}`);
    
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
        // CRITICAL FIX: Actually destroy the WebGL context properly
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          // Clean up WebGL resources first
          try {
            const numTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
            for (let i = 0; i < numTextures; i++) {
              gl.activeTexture(gl.TEXTURE0 + i);
              gl.bindTexture(gl.TEXTURE_2D, null);
            }
            
            // Clear all buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
            gl.useProgram(null);
            
            console.log(`🧹 Cleaned WebGL resources for ${config.id}`);
          } catch (error) {
            console.warn(`⚠️ Error cleaning WebGL resources for ${config.id}:`, error);
          }
        }
        
        // CRITICAL FIX: Replace canvas element to destroy context completely
        const parent = canvas.parentNode;
        const newCanvas = canvas.cloneNode(false); // Clone without context
        newCanvas.width = 1;
        newCanvas.height = 1;
        
        // Copy important attributes
        newCanvas.style.cssText = canvas.style.cssText;
        newCanvas.className = canvas.className;
        
        parent.replaceChild(newCanvas, canvas);
        
        console.log(`✨ Destroyed context and replaced canvas: ${config.id}`);
      }
    });
  }

  async createSystemContexts(systemName) {
    const configs = this.canvasConfigs[systemName];
    if (!configs) return;
    
    // INVESTIGATION 4: Check total WebGL context count across all systems
    const totalContextCount = this.getTotalWebGLContextCount();
    console.log(`📊 Total WebGL contexts across all systems: ${totalContextCount}`);
    console.log(`📊 Browser WebGL context limit: ~16-32 typical`);
    
    // CRITICAL FIX: Don't create more contexts if we're at the limit
    if (totalContextCount >= 16) {
      console.error(`🚫 BLOCKED: Cannot create ${configs.length} more contexts - already at ${totalContextCount}/16 limit`);
      console.error(`🧽 Force cleaning all existing contexts to prevent browser lockup`);
      
      // Emergency cleanup of all systems
      Object.keys(this.canvasConfigs).forEach(sysName => {
        if (sysName !== systemName) {
          this.destroySystemContexts(sysName);
        }
      });
      
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (totalContextCount > 12) {
      console.warn(`⚠️ High WebGL context count (${totalContextCount}) - may cause context loss`);
    }
    
    // INVESTIGATION 5: Add GPU memory monitoring
    this.checkGPUMemory();
    
    console.log(`🎨 Creating ${configs.length} WebGL contexts for ${systemName}`);
    
    // CRITICAL MOBILE FIX: Ensure canvas container is visible first
    const layerId = systemName === 'faceted' ? 'vib34dLayers' : `${systemName}Layers`;
    const layerContainer = document.getElementById(layerId);
    if (layerContainer && layerContainer.style.display === 'none') {
      console.log(`📱 MOBILE FIX: Making ${layerId} visible for context creation`);
      layerContainer.style.display = 'block';
      layerContainer.style.visibility = 'visible';
      layerContainer.style.opacity = '1';
      
      // CRITICAL: Wait for browser to actually render the container as visible
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log(`⏱️ Waited 100ms for ${layerId} to become visible`);
    }
    
    // INVESTIGATION 2: Stagger context creation to prevent GPU overload
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      
      // Add delay between context creation (20ms * index)
      await new Promise(resolve => setTimeout(resolve, i * 20));
      console.log(`🕒 Creating context ${i + 1}/${configs.length} for ${config.id}`);
      const canvas = document.getElementById(config.id);
      if (canvas) {
        // INVESTIGATION 1: Check canvas visibility/size
        const rect = canvas.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(canvas);
        const isVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
        const hasSize = rect.width > 0 && rect.height > 0;
        
        console.log(`🔍 Canvas ${config.id}: visible=${isVisible}, size=${rect.width}x${rect.height}, display=${computedStyle.display}`);
        
        // CRITICAL: Don't create contexts for invisible/zero-sized canvases
        if (!isVisible || !hasSize) {
          console.warn(`⚠️ Skipping context creation for ${config.id} - invisible or zero size`);
          continue; // Skip this canvas but continue with others
        }
        
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        // Ensure minimum canvas size
        const minWidth = Math.max(rect.width, 100);
        const minHeight = Math.max(rect.height, 100);
        
        canvas.width = minWidth * dpr;
        canvas.height = minHeight * dpr;
        
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
          
          // INVESTIGATION 3: Setup context loss recovery for this canvas
          this.setupContextLossRecovery(canvas, config);
          
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
    }
    
    // CRITICAL: Wait for all contexts to fully stabilize before returning
    console.log(`⏱️ Waiting 200ms for all ${configs.length} contexts to stabilize...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`✅ Context creation and stabilization complete for ${systemName}`);
  }

  getActiveContextCount() {
    if (!this.activeSystem) return 0;
    return this.countSystemContexts(this.activeSystem);
  }

  countSystemContexts(systemName) {
    const configs = this.canvasConfigs[systemName];
    if (!configs) return 0;
    
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

  validateSystemContexts(systemName) {
    const configs = this.canvasConfigs[systemName];
    if (!configs) {
      return { success: false, error: `No configs for system ${systemName}` };
    }
    
    let validContexts = 0;
    let totalCanvases = 0;
    
    for (const config of configs) {
      const canvas = document.getElementById(config.id);
      if (canvas) {
        totalCanvases++;
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl && !gl.isContextLost()) {
          // Test basic WebGL functionality
          try {
            const testProgram = gl.createProgram();
            if (testProgram) {
              gl.deleteProgram(testProgram);
              validContexts++;
            }
          } catch (error) {
            console.warn(`⚠️ Context ${config.id} failed basic test:`, error);
          }
        }
      }
    }
    
    if (validContexts === 0) {
      return { success: false, error: `No valid contexts created (0/${totalCanvases})` };
    }
    
    if (validContexts < totalCanvases) {
      console.warn(`⚠️ Only ${validContexts}/${totalCanvases} contexts valid for ${systemName}`);
    }
    
    return { success: true, validContexts, totalCanvases };
  }

  getStats() {
    return {
      activeSystem: this.activeSystem,
      activeContexts: this.getActiveContextCount(),
      maxContexts: 5,
      reduction: '75% (20 → 5 contexts)'
    };
  }
  
  /**
   * INVESTIGATION 4: Count total WebGL contexts across all systems
   */
  getTotalWebGLContextCount() {
    let totalCount = 0;
    
    // Count contexts in all system canvas configs
    Object.keys(this.canvasConfigs).forEach(systemName => {
      const configs = this.canvasConfigs[systemName];
      configs.forEach(config => {
        const canvas = document.getElementById(config.id);
        if (canvas) {
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (gl && !gl.isContextLost()) {
            totalCount++;
          }
        }
      });
    });
    
    return totalCount;
  }
  
  /**
   * INVESTIGATION 5: GPU memory monitoring
   */
  checkGPUMemory() {
    const currentContextCount = this.getTotalWebGLContextCount();
    
    // CRITICAL FIX: Don't create temp context if we're near the limit
    if (currentContextCount >= 15) {
      console.warn(`⚠️ Skipping GPU memory check - too many contexts (${currentContextCount})`);
      return;
    }
    
    try {
      // Create a temporary canvas to check GPU memory
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1;
      tempCanvas.height = 1;
      const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
      
      if (gl) {
        // Check for WebGL memory extensions
        const memoryInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (memoryInfo) {
          const renderer = gl.getParameter(memoryInfo.UNMASKED_RENDERER_WEBGL);
          console.log(`🎮 GPU Renderer: ${renderer}`);
        }
        
        // Check for memory pressure indicators
        const contextAttributes = gl.getContextAttributes();
        console.log(`💾 WebGL Context Attributes:`, contextAttributes);
        
        // Test texture creation to check memory availability
        const testTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, testTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
          console.warn(`⚠️ GPU Memory pressure detected - texture creation error: ${error}`);
        } else {
          console.log(`✅ GPU Memory available - test texture created successfully`);
        }
        
        gl.deleteTexture(testTexture);
        
        // CRITICAL: Properly dispose temp context
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) {
          ext.loseContext();
        }
      }
    } catch (error) {
      console.warn(`⚠️ GPU memory check failed:`, error);
    }
  }
  
  /**
   * INVESTIGATION 3: Context loss recovery instead of recreation
   */
  setupContextLossRecovery(canvas, config) {
    canvas.addEventListener('webglcontextlost', (event) => {
      console.warn(`🔥 WebGL context lost for ${config.id}`);
      event.preventDefault(); // Prevent default context loss behavior
      
      // Mark for recovery instead of immediate recreation
      setTimeout(() => {
        console.log(`🔄 Attempting context recovery for ${config.id}`);
        this.recoverLostContext(canvas, config);
      }, 1000); // Wait 1 second before recovery attempt
    });
    
    canvas.addEventListener('webglcontextrestored', () => {
      console.log(`✅ WebGL context restored for ${config.id}`);
    });
  }
  
  recoverLostContext(canvas, config) {
    try {
      // Force browser to recreate context
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl && !gl.isContextLost()) {
        console.log(`✅ Context recovery successful for ${config.id}`);
        return true;
      } else {
        console.warn(`❌ Context recovery failed for ${config.id}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Context recovery error for ${config.id}:`, error);
      return false;
    }
  }
}