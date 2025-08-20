/**
 * SmartCanvasPool - Context pooling with destroy/recreate on system switch
 * Reduces 20 contexts to 5 contexts (only active system has contexts)
 */

export class SmartCanvasPool {
  constructor() {
    this.activeSystem = null;
    this.systems = new Map();
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

  switchToSystem(systemName, engine) {
    console.log(`🔄 Switching to ${systemName} - destroying old contexts, creating new ones`);
    
    // Destroy current system contexts
    if (this.activeSystem) {
      this.destroySystemContexts(this.activeSystem);
    }
    
    // Create new system contexts
    this.createSystemContexts(systemName);
    this.activeSystem = systemName;
    
    // Re-initialize the engine for the new contexts
    if (engine && engine.visualizers) {
      console.log(`🔧 Re-initializing ${engine.visualizers.length} visualizers for ${systemName}`);
      
      // Destroy old visualizers
      engine.visualizers.forEach(visualizer => {
        if (visualizer.destroy) {
          visualizer.destroy();
        }
      });
      
      // Create new visualizers with new contexts
      engine.createVisualizers();
    }
    
    console.log(`✅ ${systemName} system active with 5 WebGL contexts`);
  }

  destroySystemContexts(systemName) {
    const configs = this.canvasConfigs[systemName];
    if (!configs) return;
    
    console.log(`🧹 Destroying ${configs.length} WebGL contexts for ${systemName}`);
    
    configs.forEach(config => {
      const canvas = document.getElementById(config.id);
      if (canvas) {
        // Get WebGL context to clean up
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          // Force context loss to free GPU memory
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) {
            ext.loseContext();
          }
        }
        
        // Clear canvas
        canvas.width = 1;
        canvas.height = 1;
        
        console.log(`🗑️ Destroyed context: ${config.id}`);
      }
    });
  }

  createSystemContexts(systemName) {
    const configs = this.canvasConfigs[systemName];
    if (!configs) return;
    
    console.log(`🎨 Creating ${configs.length} WebGL contexts for ${systemName}`);
    
    configs.forEach(config => {
      const canvas = document.getElementById(config.id);
      if (canvas) {
        // Set proper canvas dimensions
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // Force creation of new WebGL context
        const gl = canvas.getContext('webgl2', {
          alpha: true,
          depth: true,
          antialias: false,
          powerPreference: 'low-power'
        });
        
        if (gl) {
          console.log(`✨ Created context: ${config.id} (${canvas.width}x${canvas.height})`);
        } else {
          console.error(`❌ Failed to create context: ${config.id}`);
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

  getStats() {
    return {
      activeSystem: this.activeSystem,
      activeContexts: this.getActiveContextCount(),
      maxContexts: 5,
      reduction: '75% (20 → 5 contexts)'
    };
  }
}