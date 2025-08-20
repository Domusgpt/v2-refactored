// src/core/UnifiedCanvasManager.js
class UnifiedCanvasManager {
  constructor() {
    this.masterCanvas = document.createElement('canvas');
    this.masterCanvas.style.position = 'fixed';
    this.masterCanvas.style.width = '100%';
    this.masterCanvas.style.height = '100%';
    this.masterCanvas.style.zIndex = '-1';
    document.body.appendChild(this.masterCanvas);
    
    this.gl = this.masterCanvas.getContext('webgl2', {
      antialias: false, // Use FXAA instead for mobile
      alpha: true,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false
    });
    
    this.viewports = new Map();
    this.activeSystem = null;
    this.frameBuffers = new Map();
    this.isRendering = false;
  }

  registerVisualizationSystem(systemId, element, renderCallback) {
    const canvas2d = document.createElement('canvas');
    element.appendChild(canvas2d);
    
    // Create framebuffer for this system
    const fbo = this.createFramebuffer(element.clientWidth, element.clientHeight);
    
    this.viewports.set(systemId, {
      element,
      canvas2d,
      renderCallback,
      framebuffer: fbo,
      dirty: true
    });
    
    return systemId;
  }

  createFramebuffer(width, height) {
    const fbo = this.gl.createFramebuffer();
    const texture = this.gl.createTexture();
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 
                       width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, 
                                  this.gl.TEXTURE_2D, texture, 0);
    
    return { fbo, texture, width, height };
  }

  render() {
    if (this.isRendering) return;
    this.isRendering = true;
    
    this.resizeIfNeeded();
    
    for (const [systemId, viewport] of this.viewports) {
      if (!viewport.dirty) continue;
      
      const rect = viewport.element.getBoundingClientRect();
      
      // Skip if not visible
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      
      // Render to framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, viewport.framebuffer.fbo);
      this.gl.viewport(0, 0, viewport.framebuffer.width, viewport.framebuffer.height);
      
      // Switch active system context
      this.activeSystem = systemId;
      viewport.renderCallback(this.gl, systemId);
      
      // Copy to 2D canvas for display
      this.copyToCanvas2D(viewport);
      viewport.dirty = false;
    }
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.isRendering = false;
    
    requestAnimationFrame(() => this.render());
  }

  copyToCanvas2D(viewport) {
    const { canvas2d, framebuffer } = viewport;
    const ctx = canvas2d.getContext('2d');
    
    // Read pixels from framebuffer
    const pixels = new Uint8Array(framebuffer.width * framebuffer.height * 4);
    this.gl.readPixels(0, 0, framebuffer.width, framebuffer.height, 
                       this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
    
    // Flip vertically and draw to 2D canvas
    const imageData = new ImageData(new Uint8ClampedArray(pixels), 
                                     framebuffer.width, framebuffer.height);
    ctx.putImageData(imageData, 0, 0);
  }

  resizeIfNeeded() {
    const needsResize = this.masterCanvas.width !== window.innerWidth ||
                       this.masterCanvas.height !== window.innerHeight;
    
    if (needsResize) {
      this.masterCanvas.width = window.innerWidth;
      this.masterCanvas.height = window.innerHeight;
      
      // Mark all viewports as dirty for resize
      for (const viewport of this.viewports.values()) {
        viewport.dirty = true;
      }
    }
  }

  markSystemDirty(systemId) {
    const viewport = this.viewports.get(systemId);
    if (viewport) {
      viewport.dirty = true;
    }
  }

  getMasterGL() {
    return this.gl;
  }

  dispose() {
    // Clean up framebuffers
    for (const viewport of this.viewports.values()) {
      this.gl.deleteFramebuffer(viewport.framebuffer.fbo);
      this.gl.deleteTexture(viewport.framebuffer.texture);
    }
    
    // Remove master canvas
    if (this.masterCanvas.parentNode) {
      this.masterCanvas.parentNode.removeChild(this.masterCanvas);
    }
    
    this.viewports.clear();
  }
}

export default UnifiedCanvasManager;