/**
 * HolographicTiltController - Device tilt reactive 4D rotation system
 * Maps device orientation to 4D rotation parameters (XW, YW, ZW)
 */

export class HolographicTiltController {
    constructor() {
        this.isActive = false;
        this.baseRotations = { xw: 0, yw: 0, zw: 0 }; // User's set rotation points
        this.currentTilt = { x: 0, y: 0, z: 0 };
        this.smoothedTilt = { x: 0, y: 0, z: 0 };
        this.tiltSensitivity = 0.02; // How much tilt affects rotation
        this.smoothingFactor = 0.15; // Smoothing for tilt input
        
        console.log('🎯 HolographicTiltController initialized');
    }
    
    /**
     * Initialize tilt system - called when holographic system becomes active
     */
    init() {
        if (this.isActive) return;
        
        console.log('🎯 Activating holographic tilt control');
        this.isActive = true;
        
        // Capture current rotation parameters as base points
        this.captureBaseRotations();
        
        // Setup device orientation listener
        this.setupDeviceOrientation();
        
        // Start smooth update loop
        this.startUpdateLoop();
    }
    
    /**
     * Deactivate tilt system - called when switching away from holographic
     */
    deactivate() {
        if (!this.isActive) return;
        
        console.log('🎯 Deactivating holographic tilt control');
        this.isActive = false;
        
        // Return to base rotations smoothly
        this.returnToBase();
    }
    
    /**
     * Capture current user-set 4D rotation values as base points
     */
    captureBaseRotations() {
        if (window.holographicSystem && window.holographicSystem.getParameters) {
            const params = window.holographicSystem.getParameters();
            this.baseRotations.xw = params.rot4dXW || 0;
            this.baseRotations.yw = params.rot4dYW || 0;
            this.baseRotations.zw = params.rot4dZW || 0;
            
            console.log('🎯 Captured base 4D rotations:', this.baseRotations);
        } else {
            // Fallback to slider values
            const xwSlider = document.getElementById('rot4dXW');
            const ywSlider = document.getElementById('rot4dYW');
            const zwSlider = document.getElementById('rot4dZW');
            
            this.baseRotations.xw = parseFloat(xwSlider?.value || 0);
            this.baseRotations.yw = parseFloat(ywSlider?.value || 0);
            this.baseRotations.zw = parseFloat(zwSlider?.value || 0);
            
            console.log('🎯 Captured base 4D rotations from sliders:', this.baseRotations);
        }
    }
    
    /**
     * Setup device orientation event listener
     */
    setupDeviceOrientation() {
        // Check for device orientation support
        if (!('DeviceOrientationEvent' in window)) {
            console.warn('⚠️ Device orientation not supported');
            return;
        }
        
        // Request permission on iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        this.attachOrientationListener();
                    } else {
                        console.warn('⚠️ Device orientation permission denied');
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS or older iOS
            this.attachOrientationListener();
        }
    }
    
    /**
     * Attach the actual orientation event listener
     */
    attachOrientationListener() {
        window.addEventListener('deviceorientation', (event) => {
            if (!this.isActive) return;
            
            // Get device orientation values
            const beta = event.beta || 0;   // X-axis rotation (-180 to 180)
            const gamma = event.gamma || 0; // Y-axis rotation (-90 to 90)
            const alpha = event.alpha || 0; // Z-axis rotation (0 to 360)
            
            // Normalize values and apply deadzone
            this.currentTilt.x = this.applyDeadzone(beta, 5) / 90;   // Normalize to -2 to 2
            this.currentTilt.y = this.applyDeadzone(gamma, 3) / 45;  // Normalize to -2 to 2  
            this.currentTilt.z = this.applyDeadzone(alpha - 180, 10) / 180; // Normalize around center
            
        }, { passive: true });
        
        console.log('✅ Device orientation listener attached');
    }
    
    /**
     * Apply deadzone to prevent jitter when device is nearly level
     */
    applyDeadzone(value, deadzone) {
        return Math.abs(value) < deadzone ? 0 : value;
    }
    
    /**
     * Smooth update loop that applies tilt to 4D rotations
     */
    startUpdateLoop() {
        const update = () => {
            if (!this.isActive) return;
            
            // Smooth the tilt values to reduce jitter
            this.smoothedTilt.x += (this.currentTilt.x - this.smoothedTilt.x) * this.smoothingFactor;
            this.smoothedTilt.y += (this.currentTilt.y - this.smoothedTilt.y) * this.smoothingFactor;
            this.smoothedTilt.z += (this.currentTilt.z - this.smoothedTilt.z) * this.smoothingFactor;
            
            // Calculate 4D rotation offsets based on device tilt
            const tiltOffsets = this.calculateRotationOffsets();
            
            // Apply to holographic system
            this.apply4DRotationTilt(tiltOffsets);
            
            requestAnimationFrame(update);
        };
        
        update();
        console.log('🎯 Tilt update loop started');
    }
    
    /**
     * Calculate 4D rotation offsets from device tilt
     */
    calculateRotationOffsets() {
        // Map device tilt to 4D hyperspace rotations
        // This creates an intuitive mapping where physical device rotation
        // corresponds to 4D object rotation in hyperspace
        
        return {
            // XW plane: Affected by device X-tilt (forward/backward lean)
            xw: this.smoothedTilt.x * this.tiltSensitivity * Math.PI, // Convert to radians
            
            // YW plane: Affected by device Y-tilt (left/right lean)  
            yw: this.smoothedTilt.y * this.tiltSensitivity * Math.PI,
            
            // ZW plane: Affected by device Z-rotation (twist)
            zw: this.smoothedTilt.z * this.tiltSensitivity * Math.PI * 0.5 // Less sensitive for Z
        };
    }
    
    /**
     * Apply calculated tilt offsets to the holographic system's 4D rotations
     */
    apply4DRotationTilt(offsets) {
        if (!window.holographicSystem || window.currentSystem !== 'holographic') {
            return;
        }
        
        // Calculate final rotation values: base + tilt offset
        const finalRotations = {
            rot4dXW: this.baseRotations.xw + offsets.xw,
            rot4dYW: this.baseRotations.yw + offsets.yw,
            rot4dZW: this.baseRotations.zw + offsets.zw
        };
        
        // Wrap values to stay within -π to π range
        finalRotations.rot4dXW = this.wrapRotation(finalRotations.rot4dXW);
        finalRotations.rot4dYW = this.wrapRotation(finalRotations.rot4dYW);
        finalRotations.rot4dZW = this.wrapRotation(finalRotations.rot4dZW);
        
        // Apply to holographic system (but don't update sliders to avoid feedback)
        try {
            if (window.holographicSystem.updateParameter) {
                window.holographicSystem.updateParameter('rot4dXW', finalRotations.rot4dXW);
                window.holographicSystem.updateParameter('rot4dYW', finalRotations.rot4dYW);
                window.holographicSystem.updateParameter('rot4dZW', finalRotations.rot4dZW);
            }
        } catch (error) {
            console.warn('⚠️ Failed to apply tilt to holographic system:', error);
        }
    }
    
    /**
     * Wrap rotation value to stay within -π to π range
     */
    wrapRotation(value) {
        while (value > Math.PI) value -= 2 * Math.PI;
        while (value < -Math.PI) value += 2 * Math.PI;
        return value;
    }
    
    /**
     * Return to base rotations when tilt is deactivated
     */
    returnToBase() {
        if (!window.holographicSystem) return;
        
        console.log('🎯 Returning to base 4D rotations');
        
        // Smoothly return to base rotations
        if (window.holographicSystem.updateParameter) {
            window.holographicSystem.updateParameter('rot4dXW', this.baseRotations.xw);
            window.holographicSystem.updateParameter('rot4dYW', this.baseRotations.yw);  
            window.holographicSystem.updateParameter('rot4dZW', this.baseRotations.zw);
        }
    }
    
    /**
     * Update base rotations when user changes sliders manually
     */
    updateBaseRotation(axis, value) {
        if (axis === 'xw') this.baseRotations.xw = value;
        else if (axis === 'yw') this.baseRotations.yw = value;
        else if (axis === 'zw') this.baseRotations.zw = value;
        
        console.log(`🎯 Updated base ${axis.toUpperCase()} rotation to:`, value);
    }
    
    /**
     * Get current tilt information for debugging
     */
    getTiltInfo() {
        return {
            isActive: this.isActive,
            baseRotations: this.baseRotations,
            currentTilt: this.currentTilt,
            smoothedTilt: this.smoothedTilt,
            sensitivity: this.tiltSensitivity
        };
    }
}