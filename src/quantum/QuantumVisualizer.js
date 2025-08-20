/**
 * VIB34D Quantum Holographic Visualizer
 * Enhanced WebGL renderer with complex 3D lattice functions and holographic effects
 * This is the superior system with volumetric lighting, particles, and RGB glitch effects
 */

import { GeometryLibrary } from '../geometry/GeometryLibrary.js';

export class QuantumHolographicVisualizer {
    constructor(canvasId, role, reactivity, variant) {
        this.canvas = document.getElementById(canvasId);
        this.role = role;
        this.reactivity = reactivity;
        this.variant = variant;
        
        // Mobile-friendly WebGL context creation with fallbacks
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
        
        // Try WebGL2 first (better mobile support), then WebGL1
        this.gl = this.canvas.getContext('webgl2', contextOptions) || 
                  this.canvas.getContext('webgl', contextOptions) ||
                  this.canvas.getContext('experimental-webgl', contextOptions);
        
        if (!this.gl) {
            console.error(`WebGL not supported for ${canvasId}`);
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${canvasId}: WebGL context creation failed`);
            }
            // Show user-friendly error instead of white screen
            this.showWebGLError();
            return;
        } else {
            if (window.mobileDebug) {
                const version = this.gl.getParameter(this.gl.VERSION);
                window.mobileDebug.log(`✅ ${canvasId}: WebGL context created - ${version}`);
            }
        }
        
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        this.startTime = Date.now();
        
        // Default parameters
        this.params = {
            geometry: 0,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 200,
            intensity: 0.5,
            saturation: 0.8,
            dimension: 3.5,
            rot4dXW: 0.0,
            rot4dYW: 0.0,
            rot4dZW: 0.0
        };
        
        this.init();
    }
    
    /**
     * CRITICAL FIX: Ensure canvas is properly sized before creating WebGL context
     */
    async ensureCanvasSizedThenInitWebGL() {
        // Set proper canvas dimensions for mobile - with fallbacks
        let rect = this.canvas.getBoundingClientRect();
        const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
        
        // If canvas has no dimensions, wait for layout or use viewport
        if (rect.width === 0 || rect.height === 0) {
            // Wait for layout with promise
            await new Promise(resolve => {
                setTimeout(() => {
                    rect = this.canvas.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) {
                        // Use viewport dimensions as fallback
                        const viewWidth = window.innerWidth;
                        const viewHeight = window.innerHeight;
                        this.canvas.width = viewWidth * devicePixelRatio;
                        this.canvas.height = viewHeight * devicePixelRatio;
                        
                        if (window.mobileDebug) {
                            window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`);
                        }
                    } else {
                        this.canvas.width = rect.width * devicePixelRatio;
                        this.canvas.height = rect.height * devicePixelRatio;
                        
                        if (window.mobileDebug) {
                            window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);
                        }
                    }
                    resolve();
                }, 100);
            });
        } else {
            this.canvas.width = rect.width * devicePixelRatio;
            this.canvas.height = rect.height * devicePixelRatio;
            
            if (window.mobileDebug) {
                window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${devicePixelRatio})`);
            }
        }
        
        // NOW create WebGL context with properly sized canvas
        this.createWebGLContext();
        
        // Initialize rendering pipeline
        if (this.gl) {
            this.init();
        }
    }
    
    /**
     * Create WebGL context after canvas is properly sized
     */
    createWebGLContext() {
        // Try WebGL2 first (better mobile support), then WebGL1
        this.gl = this.canvas.getContext('webgl2', this.contextOptions) || 
                  this.canvas.getContext('webgl', this.contextOptions) ||
                  this.canvas.getContext('experimental-webgl', this.contextOptions);
        
        if (!this.gl) {
            console.error(`WebGL not supported for ${this.canvas.id}`);
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ Quantum ${this.canvas.id}: WebGL context creation failed (size: ${this.canvas.width}x${this.canvas.height})`);
            }
            // Show user-friendly error instead of white screen
            this.showWebGLError();
            return;
        } else {
            if (window.mobileDebug) {
                const version = this.gl.getParameter(this.gl.VERSION);
                window.mobileDebug.log(`✅ Quantum ${this.canvas.id}: WebGL context created - ${version} (size: ${this.canvas.width}x${this.canvas.height})`);
            }
        }
    }

    /**
     * Initialize WebGL rendering pipeline
     */
    init() {
        this.initShaders();
        this.initBuffers();
        this.resize();
    }
    
    /**
     * Initialize shaders with complex 3D lattice functions and holographic effects
     */
    initShaders() {
        const vertexShaderSource = `attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;
        
        // Mobile-friendly precision - try highp, fallback to mediump
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const precision = isMobile ? 'mediump' : 'highp';
        
        const fragmentShaderSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;

// 4D rotation matrices
mat4 rotateXW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
}

mat4 rotateYW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
}

mat4 rotateZW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
}

vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

// Complex 3D Lattice Functions - Superior Quantum Shaders
float tetrahedronLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize) - 0.5;
    float d1 = length(q);
    float d2 = length(q - vec3(0.4, 0.0, 0.0));
    float d3 = length(q - vec3(0.0, 0.4, 0.0));
    float d4 = length(q - vec3(0.0, 0.0, 0.4));
    float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
    float edges = 0.0;
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
    return max(vertices, edges * 0.5);
}

float hypercubeLattice(vec3 p, float gridSize) {
    vec3 grid = fract(p * gridSize);
    vec3 edges = min(grid, 1.0 - grid);
    float minEdge = min(min(edges.x, edges.y), edges.z);
    float lattice = 1.0 - smoothstep(0.0, 0.03, minEdge);
    
    vec3 centers = abs(grid - 0.5);
    float maxCenter = max(max(centers.x, centers.y), centers.z);
    float vertices = 1.0 - smoothstep(0.45, 0.5, maxCenter);
    
    return max(lattice * 0.7, vertices);
}

float sphereLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float sphere = 1.0 - smoothstep(0.15, 0.25, length(cell));
    
    float rings = 0.0;
    float ringRadius = length(cell.xy);
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.3)));
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.2)));
    
    return max(sphere, rings * 0.6);
}

float torusLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float majorRadius = 0.3;
    float minorRadius = 0.1;
    
    float toroidalDist = length(vec2(length(cell.xy) - majorRadius, cell.z));
    float torus = 1.0 - smoothstep(minorRadius - 0.02, minorRadius + 0.02, toroidalDist);
    
    float rings = 0.0;
    float angle = atan(cell.y, cell.x);
    rings = sin(angle * 8.0) * 0.02;
    
    return max(torus, 0.0) + rings;
}

float kleinLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float u = atan(cell.y, cell.x) / 3.14159 + 1.0;
    float v = cell.z + 0.5;
    
    float x = (2.0 + cos(u * 0.5)) * cos(u);
    float y = (2.0 + cos(u * 0.5)) * sin(u);
    float z = sin(u * 0.5) + v;
    
    vec3 kleinPoint = vec3(x, y, z) * 0.1;
    float dist = length(cell - kleinPoint);
    
    return 1.0 - smoothstep(0.1, 0.15, dist);
}

float fractalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize);
    cell = abs(cell * 2.0 - 1.0);
    
    float dist = length(max(abs(cell) - 0.3, 0.0));
    
    // Recursive subdivision
    for(int i = 0; i < 3; i++) {
        cell = abs(cell * 2.0 - 1.0);
        float subdist = length(max(abs(cell) - 0.3, 0.0)) / pow(2.0, float(i + 1));
        dist = min(dist, subdist);
    }
    
    return 1.0 - smoothstep(0.0, 0.05, dist);
}

float waveLattice(vec3 p, float gridSize) {
    float time = u_time * 0.001 * u_speed;
    vec3 cell = fract(p * gridSize) - 0.5;
    
    float wave1 = sin(p.x * gridSize * 2.0 + time * 2.0);
    float wave2 = sin(p.y * gridSize * 1.8 + time * 1.5);
    float wave3 = sin(p.z * gridSize * 2.2 + time * 1.8);
    
    float interference = (wave1 + wave2 + wave3) / 3.0;
    float amplitude = 1.0 - length(cell) * 2.0;
    
    return max(0.0, interference * amplitude);
}

float crystalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    
    // Octahedral crystal structure
    float crystal = max(max(abs(cell.x) + abs(cell.y), abs(cell.y) + abs(cell.z)), abs(cell.x) + abs(cell.z));
    crystal = 1.0 - smoothstep(0.3, 0.4, crystal);
    
    // Add crystalline faces
    float faces = 0.0;
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.x) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.y) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.z) - 0.35)));
    
    return max(crystal, faces * 0.5);
}

// Enhanced geometry function with holographic effects
float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    vec3 p3d = project4Dto3D(p);
    float gridSize = u_gridDensity * 0.08;
    
    if (geomType == 0) {
        return tetrahedronLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 1) {
        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 2) {
        return sphereLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 3) {
        return torusLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 4) {
        return kleinLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 5) {
        return fractalLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 6) {
        return waveLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 7) {
        return crystalLattice(p3d, gridSize) * u_morphFactor;
    }
    else {
        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
    }
}

// HSV to RGB conversion for better color control
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB Glitch effect for holographic shimmer
vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
    vec2 offset = vec2(intensity * 0.005, 0.0);
    float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
    float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
    float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
    return vec3(r, g, b);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // Enhanced 4D position with holographic depth
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    // Apply 4D rotations
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    // Calculate enhanced geometry value
    float value = geometryFunction(pos);
    
    // Enhanced chaos with holographic effects
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    // Enhanced intensity calculation with holographic glow
    float geometryIntensity = 1.0 - clamp(abs(value * 0.8), 0.0, 1.0);
    geometryIntensity = pow(geometryIntensity, 1.5); // More dramatic falloff
    geometryIntensity += u_clickIntensity * 0.3;
    
    // Holographic shimmer effect
    float shimmer = sin(uv.x * 20.0 + timeSpeed * 5.0) * cos(uv.y * 15.0 + timeSpeed * 3.0) * 0.1;
    geometryIntensity += shimmer * geometryIntensity;
    
    // Apply user intensity control
    float finalIntensity = geometryIntensity * u_intensity;
    
    // Enhanced HSV color system
    float baseHue = u_hue / 360.0;
    float hueShift = value * 0.2 + timeSpeed * 0.1; // Color shifts over time
    float finalHue = baseHue + hueShift;
    
    // Create rich holographic color
    vec3 hsvColor = vec3(finalHue, u_saturation, finalIntensity);
    vec3 baseColor = hsv2rgb(hsvColor);
    
    // Add holographic particles effect
    float particles = 0.0;
    vec2 particleUV = uv * 8.0;
    vec2 particleID = floor(particleUV);
    vec2 particlePos = fract(particleUV) - 0.5;
    float particleDist = length(particlePos);
    
    // Animated particles
    float particleTime = timeSpeed + dot(particleID, vec2(127.1, 311.7));
    float particleAlpha = sin(particleTime) * 0.5 + 0.5;
    particles = (1.0 - smoothstep(0.1, 0.3, particleDist)) * particleAlpha * 0.3;
    
    // Apply RGB glitch for holographic shimmer
    vec3 glitchedColor = rgbGlitch(baseColor, uv, finalIntensity * 0.5);
    
    // Combine base color with particles
    vec3 finalColor = glitchedColor + particles * vec3(1.0, 0.8, 1.0);
    
    // Enhanced role-based intensity
    float roleIntensity = u_roleIntensity;
    
    gl_FragColor = vec4(finalColor, finalIntensity * roleIntensity);
}`;
        
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
            chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
            speed: this.gl.getUniformLocation(this.program, 'u_speed'),
            hue: this.gl.getUniformLocation(this.program, 'u_hue'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
            saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
            dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
            rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
            rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
            rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
            mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
            clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
            roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity')
        };
    }
    
    /**
     * Create WebGL program from shaders
     */
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(program);
            console.error('Program linking failed:', error);
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: Shader program link failed - ${error}`);
            }
            return null;
        } else {
            if (window.mobileDebug) {
                window.mobileDebug.log(`✅ ${this.canvas?.id}: Shader program linked successfully`);
            }
        }
        
        return program;
    }
    
    /**
     * Create individual shader
     */
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            const shaderType = type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment';
            console.error(`${shaderType} shader compilation failed:`, error);
            console.error('Shader source:', source);
            
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: ${shaderType} shader compile failed - ${error}`);
                // Log first few lines of problematic shader for mobile debugging
                const sourceLines = source.split('\n').slice(0, 5).join('\\n');
                window.mobileDebug.log(`🔍 ${shaderType} shader source start: ${sourceLines}...`);
            }
            return null;
        } else {
            if (window.mobileDebug) {
                const shaderType = type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment';
                window.mobileDebug.log(`✅ ${this.canvas?.id}: ${shaderType} shader compiled successfully`);
            }
        }
        
        return shader;
    }
    
    /**
     * Initialize vertex buffers
     */
    initBuffers() {
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    /**
     * Resize canvas and viewport
     */
    resize() {
        // Mobile-optimized canvas sizing
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for mobile performance
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        // Mobile debug: Check for zero dimensions that would cause invisible rendering
        if (window.mobileDebug && (width === 0 || height === 0) && !this._zeroDimWarned) {
            window.mobileDebug.log(`⚠️ ${this.canvas?.id}: Canvas clientWidth=${width}, clientHeight=${height} - will be invisible`);
            this._zeroDimWarned = true;
        }
        
        // Only resize if dimensions actually changed (mobile optimization)
        if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            
            // Mobile debug: Log final canvas dimensions
            if (window.mobileDebug && !this._finalSizeLogged) {
                window.mobileDebug.log(`📐 ${this.canvas?.id}: Final canvas buffer ${this.canvas.width}x${this.canvas.height} (DPR=${dpr})`);
                this._finalSizeLogged = true;
            }
        }
    }
    
    /**
     * Show user-friendly WebGL error message
     */
    showWebGLError() {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillStyle = '#64ff96';
            ctx.font = '16px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('WebGL Required', this.canvas.width / 2, this.canvas.height / 2);
            ctx.fillStyle = '#888';
            ctx.font = '12px Orbitron, monospace';
            ctx.fillText('Please enable WebGL in your browser', this.canvas.width / 2, this.canvas.height / 2 + 25);
        }
    }
    
    /**
     * Update visualization parameters with immediate GPU sync
     */
    updateParameters(params) {
        this.params = { ...this.params, ...params };
        
        // CRITICAL FIX: Force immediate render with new parameters
        this.render();
        
        console.log(`🔮 Quantum visualizer updated: ${JSON.stringify(params)}`);
    }
    
    /**
     * Update mouse interaction state
     */
    updateInteraction(x, y, intensity) {
        this.mouseX = x;
        this.mouseY = y;
        this.mouseIntensity = intensity;
    }
    
    /**
     * Render frame
     */
    render() {
        if (!this.program) {
            if (window.mobileDebug && !this._noProgramWarned) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: No WebGL program for render`);
                this._noProgramWarned = true;
            }
            return;
        }
        
        this.resize();
        this.gl.useProgram(this.program);
        
        // CRITICAL FIX: Clear framebuffer before rendering
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Mobile optimization: Log render parameters once per canvas (console only)
        if (!this._renderParamsLogged) {
            console.log(`[Mobile] ${this.canvas?.id}: Render params - geometry=${this.params.geometry}, gridDensity=${this.params.gridDensity}, intensity=${this.params.intensity}`);
            this._renderParamsLogged = true;
        }
        
        // Role-specific intensity for quantum effects
        const roleIntensities = {
            'background': 0.4,
            'shadow': 0.6,
            'content': 1.0,
            'highlight': 1.3,
            'accent': 1.6
        };
        
        const time = Date.now() - this.startTime;
        
        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
        this.gl.uniform1f(this.uniforms.geometry, this.params.geometry);
        this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity);
        this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor);
        this.gl.uniform1f(this.uniforms.chaos, this.params.chaos);
        this.gl.uniform1f(this.uniforms.speed, this.params.speed);
        this.gl.uniform1f(this.uniforms.hue, this.params.hue);
        this.gl.uniform1f(this.uniforms.intensity, this.params.intensity);
        this.gl.uniform1f(this.uniforms.saturation, this.params.saturation);
        this.gl.uniform1f(this.uniforms.dimension, this.params.dimension);
        this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW);
        this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW);
        this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW);
        this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity);
        this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity);
        this.gl.uniform1f(this.uniforms.roleIntensity, roleIntensities[this.role] || 1.0);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    
    /**
     * Clean up WebGL resources
     */
    destroy() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.gl && this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
    }
}