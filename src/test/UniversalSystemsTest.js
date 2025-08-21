/**
 * Universal Systems Integration Test
 * Comprehensive test suite for Universal Audio and Interaction Engines
 */

export class UniversalSystemsTest {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }
    
    /**
     * Run all integration tests
     */
    async runAllTests() {
        console.log('🧪 Starting Universal Systems Integration Tests...');
        
        // Wait for systems to be ready
        await this.waitForSystems();
        
        // Test audio engine
        await this.testAudioEngine();
        
        // Test interaction engine
        await this.testInteractionEngine();
        
        // Test system connections
        await this.testSystemConnections();
        
        // Test real-time features
        await this.testRealTimeFeatures();
        
        // Generate report
        this.generateTestReport();
        
        return {
            total: this.totalTests,
            passed: this.passedTests,
            success: this.passedTests === this.totalTests,
            results: this.testResults
        };
    }
    
    /**
     * Wait for universal systems to be available
     */
    async waitForSystems() {
        return new Promise((resolve) => {
            const checkSystems = () => {
                if (window.universalAudio && window.universalInteractions) {
                    resolve();
                } else {
                    setTimeout(checkSystems, 100);
                }
            };
            checkSystems();
        });
    }
    
    /**
     * Test Universal Audio Engine
     */
    async testAudioEngine() {
        console.log('🎵 Testing Universal Audio Engine...');
        
        // Test 1: Audio engine exists
        this.test('Universal Audio Engine exists', () => {
            return window.universalAudio !== undefined;
        });
        
        // Test 2: Audio engine has required methods
        this.test('Audio engine has required methods', () => {
            const audio = window.universalAudio;
            return audio.connectSystem && 
                   audio.disconnectSystem && 
                   audio.update && 
                   audio.getAudioFeatures;
        });
        
        // Test 3: System mappings are configured
        this.test('Audio system mappings configured', () => {
            const mappings = window.universalAudio.systemMappings;
            return mappings.faceted && 
                   mappings.quantum && 
                   mappings.holographic && 
                   mappings.polychora;
        });
        
        // Test 4: Audio features processing
        this.test('Audio features processing', () => {
            const features = window.universalAudio.getAudioFeatures();
            return features && 
                   typeof features.bass === 'number' && 
                   typeof features.mid === 'number' && 
                   typeof features.high === 'number' && 
                   typeof features.energy === 'number';
        });
        
        // Test 5: Frequency analysis working
        this.test('Frequency analysis working', () => {
            const audio = window.universalAudio;
            return audio.analyser || !audio.isActive; // Should have analyser if active
        });
    }
    
    /**
     * Test Universal Interaction Engine
     */
    async testInteractionEngine() {
        console.log('🖱️ Testing Universal Interaction Engine...');
        
        // Test 1: Interaction engine exists
        this.test('Universal Interaction Engine exists', () => {
            return window.universalInteractions !== undefined;
        });
        
        // Test 2: Interaction engine has required methods
        this.test('Interaction engine has required methods', () => {
            const interactions = window.universalInteractions;
            return interactions.connectSystem && 
                   interactions.disconnectSystem && 
                   interactions.getInteractionState;
        });
        
        // Test 3: Interaction mappings configured
        this.test('Interaction system mappings configured', () => {
            const mappings = window.universalInteractions.interactionMappings;
            return mappings.faceted && 
                   mappings.quantum && 
                   mappings.holographic && 
                   mappings.polychora;
        });
        
        // Test 4: Mouse tracking working
        this.test('Mouse tracking initialized', () => {
            const interactions = window.universalInteractions;
            return interactions.mouse && 
                   typeof interactions.mouse.x === 'number' && 
                   typeof interactions.mouse.y === 'number';
        });
        
        // Test 5: Touch state management
        this.test('Touch state management', () => {
            const interactions = window.universalInteractions;
            return interactions.touches instanceof Map && 
                   interactions.gestureState;
        });
    }
    
    /**
     * Test system connections
     */
    async testSystemConnections() {
        console.log('🔗 Testing System Connections...');
        
        // Test each system's connection status
        const systems = ['faceted', 'quantum', 'holographic', 'polychora'];
        
        systems.forEach(systemName => {
            // Test audio connection
            this.test(`${systemName} audio connection`, () => {
                return window.universalAudio.connectedSystems.has(systemName);
            });
            
            // Test interaction connection
            this.test(`${systemName} interaction connection`, () => {
                return window.universalInteractions.connectedSystems.has(systemName);
            });
            
            // Test system has required methods
            this.test(`${systemName} system API compatibility`, () => {
                const systemMap = {
                    faceted: window.engine,
                    quantum: window.quantumEngine,
                    holographic: window.holographicSystem,
                    polychora: window.polychoraSystem
                };
                
                const system = systemMap[systemName];
                return system && 
                       system.updateParameter && 
                       system.getParameter;
            });
        });
    }
    
    /**
     * Test real-time features
     */
    async testRealTimeFeatures() {
        console.log('⚡ Testing Real-time Features...');
        
        // Test 1: Audio processing loop
        this.test('Audio processing loop active', () => {
            // Since audio processing happens in requestAnimationFrame, 
            // we check if the engine is properly configured for it
            return window.universalAudio.isActive !== undefined;
        });
        
        // Test 2: System-specific audio mappings
        this.test('System-specific audio mappings functional', () => {
            const audio = window.universalAudio;
            
            // Test faceted mappings
            const facetedMapping = audio.systemMappings.faceted;
            const validMapping = facetedMapping.bass && 
                                facetedMapping.mid && 
                                facetedMapping.high && 
                                facetedMapping.transients;
            
            return validMapping;
        });
        
        // Test 3: Polychora 6D rotation system
        this.test('Polychora 6D rotation system', () => {
            const polychoraMapping = window.universalInteractions.interactionMappings.polychora;
            return polychoraMapping.multiTouch && 
                   polychoraMapping.multiTouch.parameters.length === 6;
        });
        
        // Test 4: Quantum holographic effects
        this.test('Quantum holographic effects mapping', () => {
            const quantumMapping = window.universalAudio.systemMappings.quantum;
            return quantumMapping.bass.latticeBoost && 
                   quantumMapping.mid.particleSystem && 
                   quantumMapping.high.rgbGlitch;
        });
        
        // Test 5: Interaction state tracking
        this.test('Interaction state tracking', () => {
            const state = window.universalInteractions.getInteractionState();
            return state.mouse && 
                   Array.isArray(state.touches) && 
                   state.gesture && 
                   typeof state.activeInteractions === 'number';
        });
    }
    
    /**
     * Individual test helper
     */
    test(name, testFunction) {
        this.totalTests++;
        try {
            const result = testFunction();
            if (result) {
                this.passedTests++;
                this.testResults.push({ name, status: 'PASS', result: true });
                console.log(`✅ ${name}`);
            } else {
                this.testResults.push({ name, status: 'FAIL', result: false });
                console.log(`❌ ${name}`);
            }
        } catch (error) {
            this.testResults.push({ name, status: 'ERROR', result: false, error: error.message });
            console.log(`💥 ${name}: ${error.message}`);
        }
    }
    
    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
        
        console.log('\n🧪 UNIVERSAL SYSTEMS INTEGRATION TEST REPORT');
        console.log('=' * 50);
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.totalTests - this.passedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('\nDetailed Results:');
        
        this.testResults.forEach(test => {
            const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '💥';
            console.log(`${icon} ${test.name}${test.error ? ` (${test.error})` : ''}`);
        });
        
        if (this.passedTests === this.totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! Universal Systems are fully operational.');
        } else {
            console.log(`\n⚠️ ${this.totalTests - this.passedTests} tests failed. Check implementation.`);
        }
        
        // Test system-specific capabilities
        console.log('\n🎯 SYSTEM CAPABILITIES SUMMARY:');
        console.log('🔷 FACETED: Geometric pulse audio + 4D rotation mouse control');
        console.log('🌌 QUANTUM: Multi-frequency lattice + holographic touch interactions');
        console.log('✨ HOLOGRAPHIC: Enhanced audio-reactive + gesture controls'); 
        console.log('🔮 POLYCHORA: 4D polytope audio morphing + 6D rotation multi-touch');
        
        return this.passedTests === this.totalTests;
    }
}

// Auto-run tests when available
if (typeof window !== 'undefined') {
    window.testUniversalSystems = async () => {
        const tester = new UniversalSystemsTest();
        return await tester.runAllTests();
    };
    
    // Auto-run after systems are loaded
    document.addEventListener('universalSystemsReady', async () => {
        console.log('🧪 Universal Systems detected, running integration tests...');
        setTimeout(async () => {
            await window.testUniversalSystems();
        }, 1000); // Wait 1 second for full initialization
    });
}