/**
 * Universal Interactivity Engine
 * Framework-agnostic input adapter for VIB34D systems
 * 
 * Handles all input types:
 * - Audio (microphone, system audio, music files)
 * - Mouse/Touch (position, velocity, gestures, multi-touch)  
 * - Keyboard (patterns, rhythm, combinations)
 * - Gamepad (buttons, analog sticks, triggers, haptics)
 * - Wearables (heart rate, accelerometer, gyroscope)
 * - UI Data (forms, scrolling, clicks, focus)
 * - Network (APIs, sensors, IoT devices)
 */

export class UniversalInteractivityEngine {
    constructor() {
        this.isInitialized = false;
        this.activeInputs = new Set();
        
        // Core reactive bands - normalized 0-1 values
        this.reactiveBands = {
            movement: { value: 0, smoothed: 0, threshold: 0.1, history: [] },
            velocity: { value: 0, smoothed: 0, threshold: 0.2, history: [] }, 
            precision: { value: 0, smoothed: 0, threshold: 0.05, history: [] },
            
            // Audio frequency bands
            audio: { 
                bass: 0, mid: 0, high: 0, 
                rhythm: 0, melody: 0, energy: 0,
                smoothed: { bass: 0, mid: 0, high: 0 }
            },
            
            // Gamepad inputs
            gamepad: { 
                buttons: new Array(16).fill(0), 
                axes: new Array(4).fill(0), 
                pressure: 0,
                connected: false
            },
            
            // Wearable sensor data
            wearable: { 
                heartRate: 0, motion: 0, gesture: 0, 
                tilt: { x: 0, y: 0, z: 0 },
                acceleration: { x: 0, y: 0, z: 0 }
            },
            
            // UI interaction patterns
            ui: { 
                scroll: 0, click: 0, hover: 0, focus: 0,
                typing: { velocity: 0, rhythm: 0, pattern: [] }
            }
        };
        
        // Parameter mapping configuration
        this.parameterMappings = {
            // Shared parameters across all 3 systems
            rot4dXW: {
                sources: ['mouse.x', 'gamepad.leftStick.x', 'wearable.tilt.x'],
                range: [-6.28, 6.28],
                smoothing: 0.3
            },
            rot4dYW: {
                sources: ['mouse.y', 'gamepad.leftStick.y', 'wearable.tilt.y'],
                range: [-6.28, 6.28], 
                smoothing: 0.3
            },
            rot4dZW: {
                sources: ['audio.bass', 'gamepad.rightTrigger', 'ui.scroll'],
                range: [-6.28, 6.28],
                smoothing: 0.5
            },
            speed: {
                sources: ['audio.rhythm', 'wearable.heartRate', 'ui.typing.velocity'],
                range: [0.1, 3.0],
                smoothing: 0.6
            },
            hue: {
                sources: ['audio.melody', 'gamepad.buttons', 'ui.hover'],
                range: [0, 360],
                smoothing: 0.4
            },
            
            // System-specific parameters
            gridDensity: {
                sources: ['audio.energy', 'gamepad.pressure', 'wearable.motion'],
                range: [5, 100],
                smoothing: 0.5
            },
            morphFactor: {
                sources: ['touch.pressure', 'gamepad.rightStick', 'gesture.intensity'],
                range: [0, 2],
                smoothing: 0.4
            },
            chaos: {
                sources: ['audio.noise', 'random.walk', 'sensor.variance'],
                range: [0, 1],
                smoothing: 0.7
            }
        };
        
        // Input source adapters
        this.adapters = new Map();
        this.smoothingFactors = {
            fast: 0.2,
            medium: 0.5,
            slow: 0.8
        };
        
        // Performance monitoring
        this.performanceStats = {
            updateRate: 60,
            lastUpdate: 0,
            inputLatency: 0,
            processingTime: 0
        };
        
        console.log('🎛️ Universal Interactivity Engine initialized');
    }
    
    /**
     * Initialize all available input adapters
     */
    async initialize() {
        if (this.isInitialized) return true;
        
        console.log('🚀 Initializing Universal Interactivity Engine...');
        
        try {
            // Initialize core adapters
            await this.initAudioAdapter();
            await this.initMouseTouchAdapter();
            await this.initKeyboardAdapter();
            await this.initGamepadAdapter();
            await this.initWearableAdapter();
            await this.initUIAdapter();
            
            this.isInitialized = true;
            this.startUpdateLoop();
            
            console.log('✅ Universal Interactivity Engine ready');
            console.log(`📊 Active inputs: ${Array.from(this.activeInputs).join(', ')}`);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize interactivity engine:', error);
            return false;
        }
    }
    
    /**
     * Audio input adapter - microphone and system audio
     */
    async initAudioAdapter() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            const frequencyData = new Uint8Array(analyser.frequencyBinCount);
            
            // Try to get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false 
                } 
            });
            
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            
            this.adapters.set('audio', { 
                context: audioContext, 
                analyser, 
                frequencyData,
                enabled: true 
            });
            
            this.activeInputs.add('audio');
            console.log('🎵 Audio adapter initialized');
        } catch (error) {
            console.warn('⚠️ Audio adapter failed:', error.message);
        }
    }
    
    /**
     * Mouse and touch input adapter
     */
    async initMouseTouchAdapter() {
        const mouseState = {
            x: 0.5, y: 0.5, 
            velocity: { x: 0, y: 0 },
            buttons: 0,
            wheel: 0
        };
        
        const touchState = {
            touches: [],
            gestures: { pinch: 0, rotation: 0, swipe: { x: 0, y: 0 } }
        };
        
        // Mouse events
        document.addEventListener('mousemove', (e) => {
            const prevX = mouseState.x;
            const prevY = mouseState.y;
            
            mouseState.x = e.clientX / window.innerWidth;
            mouseState.y = 1 - (e.clientY / window.innerHeight);
            
            mouseState.velocity.x = mouseState.x - prevX;
            mouseState.velocity.y = mouseState.y - prevY;
            
            this.updateReactiveBand('movement', Math.sqrt(
                mouseState.velocity.x ** 2 + mouseState.velocity.y ** 2
            ) * 10);
        });
        
        document.addEventListener('mousedown', (e) => {
            mouseState.buttons = e.buttons;
            this.updateReactiveBand('precision', 1.0);
        });
        
        document.addEventListener('mouseup', () => {
            mouseState.buttons = 0;
            this.updateReactiveBand('precision', 0.0);
        });
        
        document.addEventListener('wheel', (e) => {
            mouseState.wheel = e.deltaY;
            this.updateReactiveBand('velocity', Math.abs(e.deltaY) / 100);
        });
        
        // Touch events
        document.addEventListener('touchstart', (e) => {
            touchState.touches = Array.from(e.touches).map(t => ({
                x: t.clientX / window.innerWidth,
                y: 1 - (t.clientY / window.innerHeight),
                id: t.identifier
            }));
        });
        
        document.addEventListener('touchmove', (e) => {
            const newTouches = Array.from(e.touches);
            // Calculate gesture recognition here
            this.updateReactiveBand('movement', newTouches.length * 0.3);
        });
        
        this.adapters.set('mouseTouchState', { mouseState, touchState });
        this.activeInputs.add('mouse/touch');
        console.log('🖱️ Mouse/Touch adapter initialized');
    }
    
    /**
     * Keyboard input adapter - rhythm and pattern detection
     */
    async initKeyboardAdapter() {
        const keyboardState = {
            activeKeys: new Set(),
            typing: { lastKeyTime: 0, rhythm: [], velocity: 0 },
            patterns: []
        };
        
        document.addEventListener('keydown', (e) => {
            if (keyboardState.activeKeys.has(e.code)) return;
            
            keyboardState.activeKeys.add(e.code);
            
            const now = Date.now();
            const timeDelta = now - keyboardState.typing.lastKeyTime;
            keyboardState.typing.lastKeyTime = now;
            
            if (timeDelta < 2000) { // Within 2 seconds
                keyboardState.typing.rhythm.push(timeDelta);
                if (keyboardState.typing.rhythm.length > 10) {
                    keyboardState.typing.rhythm.shift();
                }
                
                // Calculate typing velocity
                const avgInterval = keyboardState.typing.rhythm.reduce((a, b) => a + b, 0) / keyboardState.typing.rhythm.length;
                keyboardState.typing.velocity = Math.max(0, Math.min(1, (2000 - avgInterval) / 2000));
                
                this.updateReactiveBand('velocity', keyboardState.typing.velocity);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            keyboardState.activeKeys.delete(e.code);
        });
        
        this.adapters.set('keyboard', keyboardState);
        this.activeInputs.add('keyboard');
        console.log('⌨️ Keyboard adapter initialized');
    }
    
    /**
     * Gamepad input adapter
     */
    async initGamepadAdapter() {
        const gamepadState = { connected: false, index: -1 };
        
        window.addEventListener('gamepadconnected', (e) => {
            gamepadState.connected = true;
            gamepadState.index = e.gamepad.index;
            this.activeInputs.add('gamepad');
            console.log(`🎮 Gamepad connected: ${e.gamepad.id}`);
        });
        
        window.addEventListener('gamepaddisconnected', () => {
            gamepadState.connected = false;
            this.activeInputs.delete('gamepad');
            console.log('🎮 Gamepad disconnected');
        });
        
        this.adapters.set('gamepad', gamepadState);
        console.log('🎮 Gamepad adapter initialized');
    }
    
    /**
     * Wearable device adapter (when available)
     */
    async initWearableAdapter() {
        const wearableState = {
            heartRate: { supported: false, value: 0 },
            motion: { supported: false, x: 0, y: 0, z: 0 },
            orientation: { supported: false, alpha: 0, beta: 0, gamma: 0 }
        };
        
        // Check for device orientation API
        if ('DeviceOrientationEvent' in window) {
            window.addEventListener('deviceorientation', (e) => {
                wearableState.orientation.supported = true;
                wearableState.orientation.alpha = e.alpha || 0;
                wearableState.orientation.beta = e.beta || 0;
                wearableState.orientation.gamma = e.gamma || 0;
                
                // Convert to tilt values
                this.reactiveBands.wearable.tilt.x = (e.gamma || 0) / 90;
                this.reactiveBands.wearable.tilt.y = (e.beta || 0) / 180;
                this.reactiveBands.wearable.tilt.z = (e.alpha || 0) / 360;
            });
            
            this.activeInputs.add('device-orientation');
        }
        
        // Check for device motion API
        if ('DeviceMotionEvent' in window) {
            window.addEventListener('devicemotion', (e) => {
                wearableState.motion.supported = true;
                if (e.acceleration) {
                    wearableState.motion.x = e.acceleration.x || 0;
                    wearableState.motion.y = e.acceleration.y || 0;
                    wearableState.motion.z = e.acceleration.z || 0;
                    
                    const motion = Math.sqrt(
                        wearableState.motion.x ** 2 + 
                        wearableState.motion.y ** 2 + 
                        wearableState.motion.z ** 2
                    ) / 20; // Normalize
                    
                    this.updateReactiveBand('movement', motion);
                }
            });
            
            this.activeInputs.add('device-motion');
        }
        
        this.adapters.set('wearable', wearableState);
        console.log('⌚ Wearable adapter initialized');
    }
    
    /**
     * UI interaction adapter
     */
    async initUIAdapter() {
        const uiState = {
            scroll: { position: 0, velocity: 0, direction: 0 },
            focus: { element: null, duration: 0 },
            hover: { x: 0, y: 0, duration: 0 }
        };
        
        let lastScrollTime = Date.now();
        let lastScrollPosition = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const now = Date.now();
            const timeDelta = now - lastScrollTime;
            const positionDelta = window.scrollY - lastScrollPosition;
            
            uiState.scroll.velocity = Math.abs(positionDelta) / timeDelta;
            uiState.scroll.direction = positionDelta > 0 ? 1 : -1;
            uiState.scroll.position = window.scrollY;
            
            this.updateReactiveBand('velocity', Math.min(1, uiState.scroll.velocity / 10));
            
            lastScrollTime = now;
            lastScrollPosition = window.scrollY;
        });
        
        this.adapters.set('ui', uiState);
        this.activeInputs.add('ui');
        console.log('🖥️ UI adapter initialized');
    }
    
    /**
     * Update a reactive band value with smoothing
     */
    updateReactiveBand(band, value, smoothing = 0.5) {
        if (!this.reactiveBands[band]) return;
        
        const bandData = this.reactiveBands[band];
        bandData.value = Math.max(0, Math.min(1, value));
        bandData.smoothed = bandData.smoothed * smoothing + bandData.value * (1 - smoothing);
        
        // Update history for pattern analysis
        if (bandData.history) {
            bandData.history.push(bandData.value);
            if (bandData.history.length > 100) {
                bandData.history.shift();
            }
        }
    }
    
    /**
     * Main update loop
     */
    startUpdateLoop() {
        const update = () => {
            const startTime = performance.now();
            
            this.updateAudio();
            this.updateGamepad();
            this.updatePerformanceStats();
            
            const processingTime = performance.now() - startTime;
            this.performanceStats.processingTime = processingTime;
            
            requestAnimationFrame(update);
        };
        
        update();
        console.log('🔄 Update loop started');
    }
    
    /**
     * Update audio analysis
     */
    updateAudio() {
        const audioAdapter = this.adapters.get('audio');
        if (!audioAdapter || !audioAdapter.enabled) return;
        
        const { analyser, frequencyData } = audioAdapter;
        analyser.getByteFrequencyData(frequencyData);
        
        // Calculate frequency bands
        const bassEnd = Math.floor(frequencyData.length * 0.1);
        const midEnd = Math.floor(frequencyData.length * 0.4);
        
        let bass = 0, mid = 0, high = 0;
        
        for (let i = 0; i < bassEnd; i++) {
            bass += frequencyData[i];
        }
        bass /= (bassEnd * 255);
        
        for (let i = bassEnd; i < midEnd; i++) {
            mid += frequencyData[i];
        }
        mid /= ((midEnd - bassEnd) * 255);
        
        for (let i = midEnd; i < frequencyData.length; i++) {
            high += frequencyData[i];
        }
        high /= ((frequencyData.length - midEnd) * 255);
        
        // Update reactive bands
        this.reactiveBands.audio.bass = bass;
        this.reactiveBands.audio.mid = mid;
        this.reactiveBands.audio.high = high;
        this.reactiveBands.audio.energy = (bass + mid + high) / 3;
        this.reactiveBands.audio.rhythm = bass > 0.5 ? bass : 0;
        this.reactiveBands.audio.melody = (mid + high) / 2;
        
        // Smooth audio values
        const smoothing = 0.4;
        this.reactiveBands.audio.smoothed.bass = this.reactiveBands.audio.smoothed.bass * smoothing + bass * (1 - smoothing);
        this.reactiveBands.audio.smoothed.mid = this.reactiveBands.audio.smoothed.mid * smoothing + mid * (1 - smoothing);
        this.reactiveBands.audio.smoothed.high = this.reactiveBands.audio.smoothed.high * smoothing + high * (1 - smoothing);
    }
    
    /**
     * Update gamepad state
     */
    updateGamepad() {
        const gamepadAdapter = this.adapters.get('gamepad');
        if (!gamepadAdapter || !gamepadAdapter.connected) return;
        
        const gamepad = navigator.getGamepads()[gamepadAdapter.index];
        if (!gamepad) return;
        
        // Update buttons
        for (let i = 0; i < gamepad.buttons.length; i++) {
            this.reactiveBands.gamepad.buttons[i] = gamepad.buttons[i].value;
        }
        
        // Update axes
        for (let i = 0; i < gamepad.axes.length; i++) {
            this.reactiveBands.gamepad.axes[i] = gamepad.axes[i];
        }
        
        // Calculate pressure from buttons
        this.reactiveBands.gamepad.pressure = gamepad.buttons.reduce((total, button) => 
            total + button.value, 0) / gamepad.buttons.length;
    }
    
    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        const now = performance.now();
        if (this.performanceStats.lastUpdate > 0) {
            const timeDelta = now - this.performanceStats.lastUpdate;
            this.performanceStats.updateRate = 1000 / timeDelta;
        }
        this.performanceStats.lastUpdate = now;
    }
    
    /**
     * Get mapped parameter value for VIB34D systems
     */
    getParameterValue(parameterName) {
        const mapping = this.parameterMappings[parameterName];
        if (!mapping) return null;
        
        let value = 0;
        let sourceCount = 0;
        
        // Combine values from all active sources
        for (const source of mapping.sources) {
            const sourceValue = this.getSourceValue(source);
            if (sourceValue !== null) {
                value += sourceValue;
                sourceCount++;
            }
        }
        
        if (sourceCount === 0) return mapping.range[0];
        
        // Average and scale to parameter range
        value /= sourceCount;
        const [min, max] = mapping.range;
        return min + (value * (max - min));
    }
    
    /**
     * Get value from input source path
     */
    getSourceValue(sourcePath) {
        const parts = sourcePath.split('.');
        let current = this.reactiveBands;
        
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return null;
            }
        }
        
        return typeof current === 'number' ? current : null;
    }
    
    /**
     * Get all reactive band values (for debugging)
     */
    getReactiveBands() {
        return { ...this.reactiveBands };
    }
    
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return { 
            ...this.performanceStats, 
            activeInputs: Array.from(this.activeInputs),
            totalSources: this.activeInputs.size
        };
    }
    
    /**
     * Enable/disable specific input sources
     */
    toggleInputSource(sourceName, enabled) {
        const adapter = this.adapters.get(sourceName);
        if (adapter) {
            adapter.enabled = enabled;
            if (enabled) {
                this.activeInputs.add(sourceName);
            } else {
                this.activeInputs.delete(sourceName);
            }
            console.log(`🎛️ ${sourceName} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    /**
     * Destroy and cleanup all adapters
     */
    destroy() {
        this.activeInputs.clear();
        this.adapters.clear();
        this.isInitialized = false;
        console.log('🧹 Universal Interactivity Engine destroyed');
    }
}