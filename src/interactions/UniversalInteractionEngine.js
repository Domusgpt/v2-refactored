/**
 * Universal Interaction Engine for VIB34D Systems
 * Provides system-specific mouse/touch/click interactions for all 4 visualization systems
 * Based on deep analysis of each system's unique capabilities and mathematical properties
 */

export class UniversalInteractionEngine {
    constructor() {
        // === INTERACTION CONFIGURATION CONSTANTS ===
        // Timing thresholds
        this.DOUBLE_CLICK_THRESHOLD = 300;    // Max milliseconds between clicks for double-click
        this.HOLD_DURATION_THRESHOLD = 1000;  // Milliseconds to detect a hold gesture
        
        // Gesture detection parameters
        this.PINCH_SCALE_MIN = 0.1;          // Minimum pinch gesture scale
        this.PINCH_SCALE_MAX = 3.0;          // Maximum pinch gesture scale
        this.ROTATION_SENSITIVITY = 1.0;      // Rotation gesture sensitivity multiplier
        
        // Effect durations and intensities
        this.CHAOS_BURST_DURATION = 500;      // Duration of chaos burst effect (ms)
        this.CHAOS_BURST_INTENSITY = 2.0;     // Intensity of chaos burst
        this.GEOMETRIC_RIPPLE_DURATION = 1000; // Duration of ripple effect (ms)
        this.BASS_BOOST_DURATION = 300;       // Duration of bass boost trigger (ms)
        
        this.isActive = false;
        this.connectedSystems = new Map();
        
        // Interaction state tracking
        this.mouse = {
            x: 0.5,
            y: 0.5,
            isDown: false,
            lastX: 0.5,
            lastY: 0.5,
            velocity: { x: 0, y: 0 },
            intensity: 0
        };
        
        // Touch state for multi-touch interactions
        this.touches = new Map();
        this.gestureState = {
            pinchDistance: 0,
            lastPinchDistance: 0,
            pinchVelocity: 0,
            rotationAngle: 0,
            lastRotationAngle: 0,
            rotationVelocity: 0,
            centerX: 0.5,
            centerY: 0.5
        };
        
        // Interaction history for pattern detection
        this.interactionHistory = [];
        this.scrollHistory = [];
        
        // System-specific interaction mappings
        this.interactionMappings = this.createInteractionMappings();
        
        // Timing for interaction effects
        this.lastClickTime = 0;
        this.clickCount = 0;
        
        console.log('🖱️ Universal Interaction Engine initialized');
    }
    
    /**
     * Create system-specific interaction mappings
     * Based on deep analysis of each system's mathematical capabilities
     */
    createInteractionMappings() {
        return {
            // FACETED: Simple geometric interactions with 4D mathematics
            faceted: {
                click: {
                    effect: 'geometricRipple',
                    parameters: ['chaos', 'clickIntensity'],
                    intensity: 1.0,
                    duration: 1000
                },
                mouseMove: {
                    effect: '4dRotationShift',
                    parameters: ['rot4dXW', 'rot4dYW'],
                    sensitivity: 2.0,
                    smooth: true
                },
                scroll: {
                    effect: 'geometryCycle',
                    parameters: ['geometry'],
                    step: 1,
                    range: [0, 7]
                },
                doubleClick: {
                    effect: 'chaosBurst',
                    parameters: ['chaos'],
                    intensity: 2.0,
                    duration: 500
                }
            },
            
            // QUANTUM: Holographic manipulation with lattice control
            quantum: {
                singleTouch: {
                    effect: 'particleBurst',
                    parameters: ['intensity', 'mouseIntensity'],
                    radius: 0.3,
                    intensity: 1.5
                },
                mouseMove: {
                    effect: 'shimmerDirection',
                    parameters: ['hue', 'saturation'],
                    sensitivity: 1.5,
                    holographicShimmer: true
                },
                multiTouch: {
                    effect: 'latticeComplexityScale',
                    parameters: ['gridDensity'],
                    minTouches: 2,
                    scaleFactor: 2.0
                },
                pinchZoom: {
                    effect: 'gridDensityControl',
                    parameters: ['gridDensity'],
                    range: [5, 100],
                    dynamic: true
                }
            },
            
            // HOLOGRAPHIC: Audio-visual gesture control (enhance existing system)
            holographic: {
                enhancement: true,  // Enhance existing system
                pinchZoom: {
                    effect: 'visualizationDepth',
                    parameters: ['intensity', 'dimension'],
                    range: [0.2, 1.0],
                    audioInteraction: true
                },
                swipe: {
                    effect: 'rhythmPatternMorph',
                    parameters: ['speed', 'morphFactor'],
                    sensitivity: 2.0,
                    audioModulation: true
                },
                tap: {
                    effect: 'bassBoostTrigger',
                    parameters: ['intensity'],
                    duration: 300,
                    audioReactive: true
                },
                hold: {
                    effect: 'audioParameterFreeze',
                    parameters: 'all',
                    duration: 2000,
                    audioControl: true
                }
            },
            
            // POLYCHORA: 4D polytope control with 6D rotation interface
            polychora: {
                multiTouch: {
                    effect: '6dRotationControl',
                    parameters: ['rot4dXW', 'rot4dYW', 'rot4dZW', 'rot4dXY', 'rot4dXZ', 'rot4dYZ'],
                    fingerMapping: true,  // Each finger controls different rotation plane
                    sensitivity: 1.0
                },
                pinch: {
                    effect: 'projectionDistance',
                    parameters: ['projectionDistance'],
                    range: [1, 10],
                    smooth: true
                },
                gestureDrawing: {
                    effect: 'glassFlowTrace',
                    parameters: ['flowDirection'],
                    pathTracking: true,
                    glassEffects: true
                },
                doubleTap: {
                    effect: 'polytypeCycle',
                    parameters: ['polytope'],
                    range: [0, 5],
                    morphTransition: true
                },
                hold: {
                    effect: 'physicsToggle',
                    parameters: ['physicsEnabled'],
                    duration: 1000,
                    4dPhysics: true
                }
            }
        };
    }
    
    /**
     * Initialize interaction system with event listeners
     */
    initialize(container) {
        this.container = container || document.body;
        this.setupEventListeners();
        this.isActive = true;
        console.log('✅ Universal Interaction Engine active');
    }
    
    /**
     * Set up comprehensive event listeners
     */
    setupEventListeners() {
        // MOBILE FIX: Only capture events on canvas areas, not UI controls
        const canvasAreas = document.querySelectorAll('.canvas-container, canvas');
        
        if (canvasAreas.length === 0) {
            // Fallback to container but exclude UI elements
            this.setupSelectiveEventListeners(this.container);
        } else {
            // Attach to canvas areas only
            canvasAreas.forEach(area => {
                this.setupSelectiveEventListeners(area);
            });
        }
    }
    
    /**
     * Setup event listeners with UI element exclusion
     */
    setupSelectiveEventListeners(element) {
        // Mouse events - only on canvas areas
        element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        element.addEventListener('mouseup', this.handleMouseUp.bind(this));
        element.addEventListener('click', this.handleCanvasClick.bind(this)); // Renamed to avoid UI conflicts
        element.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        
        // Touch events - ONLY on canvas areas to avoid UI conflicts
        element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
        
        // Gesture events - canvas only
        element.addEventListener('gesturestart', this.handleGestureStart.bind(this), { passive: false });
        element.addEventListener('gesturechange', this.handleGestureChange.bind(this), { passive: false });
        element.addEventListener('gestureend', this.handleGestureEnd.bind(this), { passive: false });
        
        // Only prevent touch behaviors on canvas areas, not UI
        if (element.classList.contains('canvas-container') || element.tagName === 'CANVAS') {
            element.style.touchAction = 'none';
        }
    }
    
    /**
     * Connect a visualization system to receive interaction data
     */
    connectSystem(systemName, systemInstance) {
        this.connectedSystems.set(systemName, systemInstance);
        console.log(`🔗 Connected ${systemName} system to universal interactions`);
    }
    
    /**
     * Disconnect a visualization system
     */
    disconnectSystem(systemName) {
        this.connectedSystems.delete(systemName);
        console.log(`🔌 Disconnected ${systemName} system from universal interactions`);
    }
    
    /**
     * Handle mouse move events
     */
    handleMouseMove(event) {
        if (!this.isActive) return;
        
        const rect = this.container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        
        // Calculate velocity
        this.mouse.velocity.x = x - this.mouse.lastX;
        this.mouse.velocity.y = y - this.mouse.lastY;
        
        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        this.mouse.x = x;
        this.mouse.y = y;
        
        // Calculate movement intensity
        this.mouse.intensity = Math.min(1.0, Math.sqrt(
            this.mouse.velocity.x * this.mouse.velocity.x + 
            this.mouse.velocity.y * this.mouse.velocity.y
        ) * 20);
        
        // Update all connected systems
        this.connectedSystems.forEach((system, systemName) => {
            this.handleSystemMouseMove(systemName, system);
        });
    }
    
    /**
     * Handle mouse down events
     */
    handleMouseDown(event) {
        if (!this.isActive) return;
        this.mouse.isDown = true;
    }
    
    /**
     * Handle mouse up events
     */
    handleMouseUp(event) {
        if (!this.isActive) return;
        this.mouse.isDown = false;
    }
    
    /**
     * Handle canvas click events (renamed from handleClick to avoid UI conflicts)
     */
    handleCanvasClick(event) {
        if (!this.isActive) return;
        
        // MOBILE FIX: Only handle clicks on canvas areas, not UI elements
        if (this.isUIElement(event.target)) {
            return; // Let UI handle its own clicks
        }
        
        const now = Date.now();
        if (now - this.lastClickTime < this.DOUBLE_CLICK_THRESHOLD) {
            this.clickCount++;
        } else {
            this.clickCount = 1;
        }
        this.lastClickTime = now;
        
        // Update all connected systems
        this.connectedSystems.forEach((system, systemName) => {
            this.handleSystemClick(systemName, system);
        });
    }
    
    /**
     * Check if element is a UI control that should not be intercepted
     */
    isUIElement(element) {
        // Check if element or its parents are UI controls
        let current = element;
        while (current && current !== document.body) {
            if (current.classList.contains('system-btn') ||
                current.classList.contains('action-btn') ||
                current.classList.contains('panel-btn') ||
                current.classList.contains('geom-btn') ||
                current.classList.contains('control-panel') ||
                current.classList.contains('top-bar') ||
                current.classList.contains('mobile-collapse-btn') ||
                current.tagName === 'BUTTON' ||
                current.tagName === 'INPUT' ||
                current.tagName === 'SELECT' ||
                current.type === 'range') {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }
    
    /**
     * Get the proper container rectangle for touch coordinate calculation
     */
    getContainerRect(target) {
        // Try to find the closest canvas container or use the main container
        let container = target;
        while (container && container !== document.body) {
            if (container.classList.contains('canvas-container') || 
                container.tagName === 'CANVAS') {
                break;
            }
            container = container.parentElement;
        }
        
        // Fallback to main container if no canvas container found
        if (!container || container === document.body) {
            container = this.container || document.body;
        }
        
        return container.getBoundingClientRect();
    }
    
    /**
     * Handle double click events
     */
    handleDoubleClick(event) {
        if (!this.isActive) return;
        
        this.connectedSystems.forEach((system, systemName) => {
            this.handleSystemDoubleClick(systemName, system);
        });
    }
    
    /**
     * Handle scroll/wheel events
     */
    handleWheel(event) {
        if (!this.isActive) return;
        
        event.preventDefault();
        const scrollDelta = event.deltaY;
        
        // Track scroll history for pattern detection
        this.scrollHistory.push({
            delta: scrollDelta,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.scrollHistory.length > 30) {
            this.scrollHistory.shift();
        }
        
        // Update all connected systems
        this.connectedSystems.forEach((system, systemName) => {
            this.handleSystemScroll(systemName, system, scrollDelta);
        });
    }
    
    /**
     * Handle touch start events
     */
    handleTouchStart(event) {
        if (!this.isActive) return;
        
        // MOBILE FIX: Don't intercept touches on UI elements
        if (event.touches.length > 0 && this.isUIElement(event.touches[0].target)) {
            return; // Let UI handle its own touches
        }
        
        event.preventDefault();
        
        const containerRect = this.getContainerRect(event.target);
        
        Array.from(event.changedTouches).forEach(touch => {
            this.touches.set(touch.identifier, {
                x: (touch.clientX - containerRect.left) / containerRect.width,
                y: (touch.clientY - containerRect.top) / containerRect.height,
                startTime: Date.now()
            });
        });
        
        this.updateGestureState();
        
        // Handle system-specific touch start
        this.connectedSystems.forEach((system, systemName) => {
            this.handleSystemTouchStart(systemName, system, event);
        });
    }
    
    /**
     * Handle touch move events
     */
    handleTouchMove(event) {
        if (!this.isActive) return;
        
        // MOBILE FIX: Don't intercept touches on UI elements
        if (event.touches.length > 0 && this.isUIElement(event.touches[0].target)) {
            return; // Let UI handle its own touches
        }
        
        event.preventDefault();
        
        const containerRect = this.getContainerRect(event.target);
        
        Array.from(event.changedTouches).forEach(touch => {
            if (this.touches.has(touch.identifier)) {
                this.touches.set(touch.identifier, {
                    ...this.touches.get(touch.identifier),
                    x: (touch.clientX - containerRect.left) / containerRect.width,
                    y: (touch.clientY - containerRect.top) / containerRect.height
                });
            }
        });
        
        this.updateGestureState();
        
        // Handle system-specific touch move
        this.connectedSystems.forEach((system, systemName) => {
            this.handleSystemTouchMove(systemName, system, event);
        });
    }
    
    /**
     * Handle touch end events
     */
    handleTouchEnd(event) {
        if (!this.isActive) return;
        
        // MOBILE FIX: Don't intercept touches on UI elements
        if (event.changedTouches.length > 0 && this.isUIElement(event.changedTouches[0].target)) {
            return; // Let UI handle its own touches
        }
        
        Array.from(event.changedTouches).forEach(touch => {
            this.touches.delete(touch.identifier);
        });
        
        this.updateGestureState();
        
        // Handle system-specific touch end
        this.connectedSystems.forEach((system, systemName) => {
            this.handleSystemTouchEnd(systemName, system, event);
        });
    }
    
    /**
     * Update gesture state for multi-touch gestures
     */
    updateGestureState() {
        const touchArray = Array.from(this.touches.values());
        
        if (touchArray.length >= 2) {
            // Calculate pinch distance
            const dx = touchArray[0].x - touchArray[1].x;
            const dy = touchArray[0].y - touchArray[1].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.gestureState.lastPinchDistance = this.gestureState.pinchDistance;
            this.gestureState.pinchDistance = distance;
            this.gestureState.pinchVelocity = distance - this.gestureState.lastPinchDistance;
            
            // Calculate rotation
            const angle = Math.atan2(dy, dx);
            this.gestureState.lastRotationAngle = this.gestureState.rotationAngle;
            this.gestureState.rotationAngle = angle;
            this.gestureState.rotationVelocity = angle - this.gestureState.lastRotationAngle;
            
            // Calculate center point
            this.gestureState.centerX = (touchArray[0].x + touchArray[1].x) / 2;
            this.gestureState.centerY = (touchArray[0].y + touchArray[1].y) / 2;
        }
    }
    
    /**
     * Handle system-specific mouse move interactions
     */
    handleSystemMouseMove(systemName, system) {
        const mapping = this.interactionMappings[systemName];
        if (!mapping || !mapping.mouseMove) return;
        
        const { effect, parameters, sensitivity } = mapping.mouseMove;
        
        switch (systemName) {
            case 'faceted':
                if (effect === '4dRotationShift' && system.updateParameter) {
                    // Map mouse X/Y to 4D rotations
                    const rotXW = (this.mouse.x - 0.5) * sensitivity * Math.PI;
                    const rotYW = (this.mouse.y - 0.5) * sensitivity * Math.PI;
                    system.updateParameter('rot4dXW', rotXW);
                    system.updateParameter('rot4dYW', rotYW);
                }
                break;
                
            case 'quantum':
                if (effect === 'shimmerDirection' && system.updateParameter) {
                    // Control holographic shimmer with mouse movement
                    const hue = 200 + (this.mouse.x * 120); // 200-320 range
                    const saturation = 0.6 + (this.mouse.y * 0.4); // 0.6-1.0 range
                    system.updateParameter('hue', hue);
                    system.updateParameter('saturation', saturation);
                }
                break;
                
            case 'polychora':
                // Polychora uses multi-touch for rotation control
                break;
        }
        
        // Update mouse interaction state in system
        if (system.updateMouseState) {
            system.updateMouseState(this.mouse.x, this.mouse.y, this.mouse.intensity);
        }
    }
    
    /**
     * Handle system-specific click interactions
     */
    handleSystemClick(systemName, system) {
        const mapping = this.interactionMappings[systemName];
        if (!mapping || !mapping.click) return;
        
        const { effect, parameters, intensity, duration } = mapping.click;
        
        switch (systemName) {
            case 'faceted':
                if (effect === 'geometricRipple' && system.updateParameter) {
                    // Create geometric ripple effect
                    system.updateParameter('chaos', 0.8 * intensity);
                    
                    // Fade chaos back to normal
                    setTimeout(() => {
                        if (system.updateParameter) {
                            system.updateParameter('chaos', 0.2);
                        }
                    }, duration);
                }
                break;
                
            case 'quantum':
                // Quantum uses touch for particle bursts
                break;
                
            case 'holographic':
                if (effect === 'bassBoostTrigger' && system.updateParameter) {
                    // Trigger bass boost effect
                    system.updateParameter('intensity', 1.0);
                    
                    setTimeout(() => {
                        if (system.updateParameter) {
                            system.updateParameter('intensity', 0.5);
                        }
                    }, duration || this.BASS_BOOST_DURATION);
                }
                break;
        }
        
        // Trigger click intensity in system
        if (system.triggerClick) {
            system.triggerClick(intensity);
        }
    }
    
    /**
     * Handle system-specific double click interactions
     */
    handleSystemDoubleClick(systemName, system) {
        const mapping = this.interactionMappings[systemName];
        if (!mapping || !mapping.doubleClick) return;
        
        const { effect, parameters, intensity, duration } = mapping.doubleClick;
        
        switch (systemName) {
            case 'faceted':
                if (effect === 'chaosBurst' && system.updateParameter) {
                    // Create chaos burst effect
                    system.updateParameter('chaos', intensity);
                    
                    setTimeout(() => {
                        if (system.updateParameter) {
                            system.updateParameter('chaos', 0.2);
                        }
                    }, duration);
                }
                break;
                
            case 'polychora':
                if (effect === 'polytypeCycle' && system.updateParameter) {
                    // Cycle through polytope types
                    const currentPolytope = system.getParameter ? system.getParameter('polytope') : 0;
                    const nextPolytope = (currentPolytope + 1) % 6;
                    system.updateParameter('polytope', nextPolytope);
                }
                break;
        }
    }
    
    /**
     * Handle system-specific scroll interactions
     */
    handleSystemScroll(systemName, system, scrollDelta) {
        const mapping = this.interactionMappings[systemName];
        if (!mapping || !mapping.scroll) return;
        
        const { effect, parameters, step, range } = mapping.scroll;
        
        switch (systemName) {
            case 'faceted':
                if (effect === 'geometryCycle' && system.updateParameter) {
                    // Cycle through geometry types
                    const currentGeometry = system.getParameter ? system.getParameter('geometry') : 0;
                    const direction = scrollDelta > 0 ? 1 : -1;
                    let newGeometry = currentGeometry + (direction * step);
                    
                    // Wrap around
                    if (newGeometry > range[1]) newGeometry = range[0];
                    if (newGeometry < range[0]) newGeometry = range[1];
                    
                    system.updateParameter('geometry', newGeometry);
                }
                break;
        }
    }
    
    /**
     * Handle system-specific touch start
     */
    handleSystemTouchStart(systemName, system, event) {
        const mapping = this.interactionMappings[systemName];
        if (!mapping) return;
        
        const touchCount = this.touches.size;
        
        switch (systemName) {
            case 'quantum':
                if (touchCount === 1 && mapping.singleTouch && system.updateParameter) {
                    // Single touch particle burst
                    const { intensity, radius } = mapping.singleTouch;
                    system.updateParameter('intensity', intensity);
                    system.updateParameter('mouseIntensity', intensity);
                }
                break;
                
            case 'polychora':
                if (touchCount >= 2 && mapping.multiTouch && system.updateParameter) {
                    // Multi-touch 6D rotation control setup
                    this.setupPolychora6DControl(system);
                }
                break;
        }
    }
    
    /**
     * Handle system-specific touch move
     */
    handleSystemTouchMove(systemName, system, event) {
        const mapping = this.interactionMappings[systemName];
        if (!mapping) return;
        
        const touchCount = this.touches.size;
        
        switch (systemName) {
            case 'quantum':
                if (touchCount >= 2 && mapping.pinchZoom && system.updateParameter) {
                    // Pinch to zoom grid density
                    const { range } = mapping.pinchZoom;
                    const pinchScale = Math.max(this.PINCH_SCALE_MIN, Math.min(this.PINCH_SCALE_MAX, this.gestureState.pinchDistance * 2));
                    const gridDensity = range[0] + (range[1] - range[0]) * (pinchScale / 3.0);
                    system.updateParameter('gridDensity', gridDensity);
                }
                break;
                
            case 'polychora':
                if (touchCount >= 2 && mapping.multiTouch) {
                    this.updatePolychora6DControl(system);
                }
                break;
        }
    }
    
    /**
     * Handle system-specific touch end
     */
    handleSystemTouchEnd(systemName, system, event) {
        // Handle touch end cleanup if needed
    }
    
    /**
     * Setup 6D rotation control for Polychora system
     */
    setupPolychora6DControl(system) {
        // Initialize 6D rotation control state
        this.polychora6DState = {
            baseRotations: {},
            touchMapping: new Map()
        };
        
        // Store current rotations as base
        const rotationParams = ['rot4dXW', 'rot4dYW', 'rot4dZW', 'rot4dXY', 'rot4dXZ', 'rot4dYZ'];
        rotationParams.forEach(param => {
            this.polychora6DState.baseRotations[param] = system.getParameter ? system.getParameter(param) : 0;
        });
    }
    
    /**
     * Update 6D rotation control for Polychora system
     */
    updatePolychora6DControl(system) {
        if (!this.polychora6DState) return;
        
        const touchArray = Array.from(this.touches.entries());
        const rotationParams = ['rot4dXW', 'rot4dYW', 'rot4dZW', 'rot4dXY', 'rot4dXZ', 'rot4dYZ'];
        
        // Map each touch to a rotation plane
        touchArray.slice(0, 6).forEach(([touchId, touch], index) => {
            if (index < rotationParams.length) {
                const param = rotationParams[index];
                const baseRotation = this.polychora6DState.baseRotations[param] || 0;
                
                // Calculate rotation based on touch position
                const rotationValue = baseRotation + (touch.x - 0.5) * Math.PI * 2;
                
                if (system.updateParameter) {
                    system.updateParameter(param, rotationValue);
                }
            }
        });
    }
    
    /**
     * Get current interaction state
     */
    getInteractionState() {
        return {
            mouse: { ...this.mouse },
            touches: Array.from(this.touches.entries()),
            gesture: { ...this.gestureState },
            activeInteractions: this.connectedSystems.size
        };
    }
    
    /**
     * Enable/disable interaction processing
     */
    setEnabled(enabled) {
        this.isActive = enabled;
        console.log(`🖱️ Universal Interaction Engine ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Clean up interaction resources
     */
    destroy() {
        this.connectedSystems.clear();
        this.touches.clear();
        console.log('🧹 Universal Interaction Engine destroyed');
    }
}

// Global instance
window.universalInteractions = new UniversalInteractionEngine();