/**
 * VIB34D DEVICE TILT TO 4D ROTATION SYSTEM
 * Maps device orientation to 4D rotation parameters for immersive interaction
 */

export class DeviceTiltHandler {
    constructor() {
        this.isEnabled = false;
        this.isSupported = false;
        this.sensitivity = 1.0;
        this.smoothing = 0.1; // Smoothing factor (0-1, lower = smoother)
        
        // Current device orientation (radians)
        this.currentTilt = {
            alpha: 0, // Z-axis rotation (compass heading)
            beta: 0,  // X-axis rotation (front-back tilt)  
            gamma: 0  // Y-axis rotation (left-right tilt)
        };
        
        // Smoothed 4D rotation values
        this.smoothedRotation = {
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0
        };
        
        // Base rotation values (from presets/manual control)
        this.baseRotation = {
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0
        };
        
        // Mapping configuration
        this.mapping = {
            // Device beta (front-back tilt) -> 4D XW rotation
            betaToXW: {
                scale: 0.01, // Radians per degree of device tilt
                range: [-45, 45], // Degrees of device tilt to use
                clamp: [-1.5, 1.5] // 4D rotation limits (radians)
            },
            // Device gamma (left-right tilt) -> 4D YW rotation  
            gammaToYW: {
                scale: 0.015,
                range: [-30, 30],
                clamp: [-1.5, 1.5]
            },
            // Device alpha (compass heading) -> 4D ZW rotation
            alphaToZW: {
                scale: 0.008,
                range: [-180, 180],
                clamp: [-2.0, 2.0]
            }
        };
        
        this.boundHandleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    }
    
    /**
     * Check if device orientation is supported
     */
    checkSupport() {
        this.isSupported = 'DeviceOrientationEvent' in window;
        
        if (!this.isSupported) {
            console.warn('🎯 DEVICE TILT: Not supported on this device/browser');
            return false;
        }
        
        // Check for iOS 13+ permission requirement
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            console.log('🎯 DEVICE TILT: iOS device detected - permission required');
            return 'permission-required';
        }
        
        console.log('🎯 DEVICE TILT: Supported and ready');
        return true;
    }
    
    /**
     * Request permission for iOS devices
     */
    async requestPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    console.log('🎯 DEVICE TILT: iOS permission granted');
                    return true;
                } else {
                    console.warn('🎯 DEVICE TILT: iOS permission denied');
                    return false;
                }
            } catch (error) {
                console.error('🎯 DEVICE TILT: Permission request failed:', error);
                return false;
            }
        }
        return true; // Non-iOS devices don't need permission
    }
    
    /**
     * Enable device tilt control
     */
    async enable() {
        if (!this.checkSupport()) {
            return false;
        }
        
        // Request permission if needed
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            return false;
        }
        
        // Store current parameter values as base
        if (window.userParameterState) {
            this.baseRotation.rot4dXW = window.userParameterState.rot4dXW || 0;
            this.baseRotation.rot4dYW = window.userParameterState.rot4dYW || 0;
            this.baseRotation.rot4dZW = window.userParameterState.rot4dZW || 0;
        }
        
        // Initialize smoothed values to current base
        this.smoothedRotation = { ...this.baseRotation };
        
        window.addEventListener('deviceorientation', this.boundHandleDeviceOrientation);
        this.isEnabled = true;
        
        console.log('🎯 DEVICE TILT: Enabled - tilt your device to control 4D rotation!');\n        console.log('🎯 Base rotation values:', this.baseRotation);
        
        // Show tilt UI indicator
        this.showTiltIndicator(true);
        
        return true;
    }
    
    /**
     * Disable device tilt control
     */
    disable() {
        window.removeEventListener('deviceorientation', this.boundHandleDeviceOrientation);
        this.isEnabled = false;
        
        // Reset to base rotation values
        if (window.updateParameter) {
            window.updateParameter('rot4dXW', this.baseRotation.rot4dXW);
            window.updateParameter('rot4dYW', this.baseRotation.rot4dYW);
            window.updateParameter('rot4dZW', this.baseRotation.rot4dZW);
        }
        
        console.log('🎯 DEVICE TILT: Disabled - reset to base rotation');
        
        // Hide tilt UI indicator
        this.showTiltIndicator(false);
    }
    
    /**
     * Handle device orientation changes
     */
    handleDeviceOrientation(event) {\n        if (!this.isEnabled) return;\n        \n        // Get raw orientation values (convert to radians)\n        const alpha = (event.alpha || 0) * Math.PI / 180; // Z-axis (compass)\n        const beta = (event.beta || 0) * Math.PI / 180;   // X-axis (front-back)\n        const gamma = (event.gamma || 0) * Math.PI / 180; // Y-axis (left-right)\n        \n        // Update current tilt values\n        this.currentTilt = { alpha, beta, gamma };\n        \n        // Map device orientation to 4D rotation values\n        const targetRotation = this.mapToRotation(event);\n        \n        // Apply smoothing to prevent jittery movement\n        this.smoothedRotation.rot4dXW = this.lerp(\n            this.smoothedRotation.rot4dXW,\n            targetRotation.rot4dXW,\n            this.smoothing\n        );\n        \n        this.smoothedRotation.rot4dYW = this.lerp(\n            this.smoothedRotation.rot4dYW,\n            targetRotation.rot4dYW,\n            this.smoothing\n        );\n        \n        this.smoothedRotation.rot4dZW = this.lerp(\n            this.smoothedRotation.rot4dZW,\n            targetRotation.rot4dZW,\n            this.smoothing\n        );\n        \n        // Apply to visualization system\n        if (window.updateParameter) {\n            window.updateParameter('rot4dXW', this.smoothedRotation.rot4dXW);\n            window.updateParameter('rot4dYW', this.smoothedRotation.rot4dYW);\n            window.updateParameter('rot4dZW', this.smoothedRotation.rot4dZW);\n        }\n        \n        // Update UI display if available\n        this.updateTiltDisplay();\n    }\n    \n    /**\n     * Map device orientation to 4D rotation parameters\n     */\n    mapToRotation(event) {\n        const betaDeg = event.beta || 0;  // Front-back tilt (-180 to 180)\n        const gammaDeg = event.gamma || 0; // Left-right tilt (-90 to 90)\n        const alphaDeg = event.alpha || 0; // Compass heading (0 to 360)\n        \n        // Map beta (front-back tilt) to XW rotation\n        const betaClamped = Math.max(this.mapping.betaToXW.range[0], \n            Math.min(this.mapping.betaToXW.range[1], betaDeg));\n        const rot4dXW = this.baseRotation.rot4dXW + \n            (betaClamped * this.mapping.betaToXW.scale * this.sensitivity);\n        \n        // Map gamma (left-right tilt) to YW rotation\n        const gammaClamped = Math.max(this.mapping.gammaToYW.range[0],\n            Math.min(this.mapping.gammaToYW.range[1], gammaDeg));\n        const rot4dYW = this.baseRotation.rot4dYW + \n            (gammaClamped * this.mapping.gammaToYW.scale * this.sensitivity);\n        \n        // Map alpha (compass) to ZW rotation\n        let alphaNormalized = alphaDeg;\n        if (alphaNormalized > 180) alphaNormalized -= 360; // Normalize to -180 to 180\n        const alphaClamped = Math.max(this.mapping.alphaToZW.range[0],\n            Math.min(this.mapping.alphaToZW.range[1], alphaNormalized));\n        const rot4dZW = this.baseRotation.rot4dZW + \n            (alphaClamped * this.mapping.alphaToZW.scale * this.sensitivity);\n        \n        // Apply final clamping to prevent extreme values\n        return {\n            rot4dXW: Math.max(this.mapping.betaToXW.clamp[0],\n                Math.min(this.mapping.betaToXW.clamp[1], rot4dXW)),\n            rot4dYW: Math.max(this.mapping.gammaToYW.clamp[0],\n                Math.min(this.mapping.gammaToYW.clamp[1], rot4dYW)),\n            rot4dZW: Math.max(this.mapping.alphaToZW.clamp[0],\n                Math.min(this.mapping.alphaToZW.clamp[1], rot4dZW))\n        };\n    }\n    \n    /**\n     * Linear interpolation for smooth transitions\n     */\n    lerp(start, end, factor) {\n        return start + (end - start) * factor;\n    }\n    \n    /**\n     * Update base rotation values (from preset loading or manual adjustment)\n     */\n    updateBaseRotation(rot4dXW, rot4dYW, rot4dZW) {\n        this.baseRotation.rot4dXW = rot4dXW || 0;\n        this.baseRotation.rot4dYW = rot4dYW || 0;\n        this.baseRotation.rot4dZW = rot4dZW || 0;\n        \n        console.log('🎯 DEVICE TILT: Base rotation updated:', this.baseRotation);\n    }\n    \n    /**\n     * Set tilt sensitivity (0.1 to 3.0)\n     */\n    setSensitivity(value) {\n        this.sensitivity = Math.max(0.1, Math.min(3.0, value));\n        console.log(`🎯 DEVICE TILT: Sensitivity set to ${this.sensitivity}`);\n    }\n    \n    /**\n     * Set smoothing factor (0.01 to 1.0)\n     */\n    setSmoothing(value) {\n        this.smoothing = Math.max(0.01, Math.min(1.0, value));\n        console.log(`🎯 DEVICE TILT: Smoothing set to ${this.smoothing}`);\n    }\n    \n    /**\n     * Show/hide tilt indicator UI\n     */\n    showTiltIndicator(show) {\n        let indicator = document.getElementById('tilt-indicator');\n        \n        if (show && !indicator) {\n            // Create tilt indicator\n            indicator = document.createElement('div');\n            indicator.id = 'tilt-indicator';\n            indicator.innerHTML = `\n                <div class=\"tilt-status\">\n                    <div class=\"tilt-icon\">📱</div>\n                    <div class=\"tilt-text\">4D Tilt Active</div>\n                    <div class=\"tilt-values\">\n                        <span id=\"tilt-xw\">XW: 0.00</span>\n                        <span id=\"tilt-yw\">YW: 0.00</span>\n                        <span id=\"tilt-zw\">ZW: 0.00</span>\n                    </div>\n                </div>\n            `;\n            \n            indicator.style.cssText = `\n                position: fixed;\n                top: 10px;\n                right: 10px;\n                background: rgba(0, 0, 0, 0.8);\n                color: #0ff;\n                padding: 8px 12px;\n                border-radius: 8px;\n                font-family: 'Orbitron', monospace;\n                font-size: 11px;\n                z-index: 10000;\n                backdrop-filter: blur(10px);\n                border: 1px solid rgba(0, 255, 255, 0.3);\n                box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);\n            `;\n            \n            document.body.appendChild(indicator);\n        } else if (!show && indicator) {\n            // Remove tilt indicator\n            indicator.remove();\n        }\n    }\n    \n    /**\n     * Update tilt display values\n     */\n    updateTiltDisplay() {\n        const xwDisplay = document.getElementById('tilt-xw');\n        const ywDisplay = document.getElementById('tilt-yw');\n        const zwDisplay = document.getElementById('tilt-zw');\n        \n        if (xwDisplay) xwDisplay.textContent = `XW: ${this.smoothedRotation.rot4dXW.toFixed(2)}`;\n        if (ywDisplay) ywDisplay.textContent = `YW: ${this.smoothedRotation.rot4dYW.toFixed(2)}`;\n        if (zwDisplay) zwDisplay.textContent = `ZW: ${this.smoothedRotation.rot4dZW.toFixed(2)}`;\n    }\n    \n    /**\n     * Get current tilt status\n     */\n    getStatus() {\n        return {\n            isSupported: this.isSupported,\n            isEnabled: this.isEnabled,\n            sensitivity: this.sensitivity,\n            smoothing: this.smoothing,\n            currentTilt: { ...this.currentTilt },\n            smoothedRotation: { ...this.smoothedRotation },\n            baseRotation: { ...this.baseRotation }\n        };\n    }\n}\n\n// Create global instance\nif (typeof window !== 'undefined') {\n    window.deviceTiltHandler = new DeviceTiltHandler();\n    \n    // Add to global functions for UI integration\n    window.enableDeviceTilt = async () => {\n        return await window.deviceTiltHandler.enable();\n    };\n    \n    window.disableDeviceTilt = () => {\n        window.deviceTiltHandler.disable();\n    };\n    \n    window.toggleDeviceTilt = async () => {\n        if (window.deviceTiltHandler.isEnabled) {\n            window.deviceTiltHandler.disable();\n            return false;\n        } else {\n            return await window.deviceTiltHandler.enable();\n        }\n    };\n    \n    window.setTiltSensitivity = (value) => {\n        window.deviceTiltHandler.setSensitivity(value);\n    };\n    \n    console.log('🎯 DEVICE TILT: System loaded and ready');\n}\n\nexport default DeviceTiltHandler;