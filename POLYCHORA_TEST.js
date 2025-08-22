/**
 * POLYCHORA SYSTEM TEST - Verify Phase 2 activation worked
 * Run this in browser console on index.html
 */

console.log('🔮 POLYCHORA SYSTEM ACTIVATION TEST');

// Test 1: Check if system can be imported
async function testPolychoraImport() {
    console.log('\n📝 Test 1: Importing Polychora System...');
    
    try {
        const { PolychoraSystem } = await import('./src/core/PolychoraSystem.js');
        console.log('✅ PolychoraSystem imported successfully');
        
        const system = new PolychoraSystem();
        console.log('✅ PolychoraSystem instance created');
        console.log(`🔮 Polytopes available: ${system.getPolytopeNames().join(', ')}`);
        console.log(`🔮 Parameters count: ${Object.keys(system.parameters).length}`);
        
        return system;
    } catch (error) {
        console.error('❌ Failed to import Polychora system:', error);
        return null;
    }
}

// Test 2: Check if physics engine works
async function testPhysicsEngine() {
    console.log('\n📝 Test 2: Testing 4D Physics Engine...');
    
    try {
        const { Polychora4DPhysics } = await import('./src/physics/Polychora4DPhysics.js');
        console.log('✅ Polychora4DPhysics imported successfully');
        
        const physics = new Polychora4DPhysics();
        console.log('✅ Physics engine instance created');
        
        // Test constants
        console.log(`🔮 Physics constants: Gravity=${physics.DEFAULT_GRAVITY_4D}, Timestep=${physics.PHYSICS_TIMESTEP}`);
        
        // Test 4D vector math
        const vec1 = [1, 2, 3, 4];
        const vec2 = [5, 6, 7, 8];
        const result = physics.add4D(vec1, vec2);
        console.log(`🔮 4D vector addition test: [${vec1}] + [${vec2}] = [${result}]`);
        
        if (result[0] === 6 && result[1] === 8 && result[2] === 10 && result[3] === 12) {
            console.log('✅ 4D vector math working correctly');
        } else {
            console.error('❌ 4D vector math failed');
        }
        
        return physics;
    } catch (error) {
        console.error('❌ Failed to test physics engine:', error);
        return null;
    }
}

// Test 3: Test system switching
async function testSystemSwitching() {
    console.log('\n📝 Test 3: Testing Polychora System Switching...');
    
    if (typeof switchSystem !== 'function') {
        console.error('❌ switchSystem function not available');
        return false;
    }
    
    try {
        // Try to switch to polychora
        await switchSystem('polychora');
        
        // Check if polychora layers are visible
        const polychoraLayers = document.getElementById('polychoraLayers');
        if (polychoraLayers && polychoraLayers.style.display === 'block') {
            console.log('✅ Polychora layers visible after system switch');
        } else {
            console.error('❌ Polychora layers not visible after switch');
        }
        
        // Check if polychoraSystem exists
        if (window.polychoraSystem) {
            console.log('✅ window.polychoraSystem exists');
            console.log(`🔮 System active: ${window.polychoraSystem.isActive}`);
        } else {
            console.error('❌ window.polychoraSystem not created');
        }
        
        return true;
    } catch (error) {
        console.error('❌ System switching failed:', error);
        return false;
    }
}

// Test 4: Test universal system connections
async function testUniversalConnections() {
    console.log('\n📝 Test 4: Testing Universal System Connections...');
    
    let audioConnected = false;
    let interactionConnected = false;
    
    if (window.universalAudio) {
        const connectedSystems = window.universalAudio.connectedSystems;
        if (connectedSystems && connectedSystems.has('polychora')) {
            console.log('✅ Polychora connected to Universal Audio Engine');
            audioConnected = true;
        } else {
            console.warn('⚠️ Polychora not connected to Universal Audio Engine');
        }
    } else {
        console.warn('⚠️ Universal Audio Engine not available');
    }
    
    if (window.universalInteractions) {
        const connectedSystems = window.universalInteractions.connectedSystems;
        if (connectedSystems && connectedSystems.has('polychora')) {
            console.log('✅ Polychora connected to Universal Interaction Engine');
            interactionConnected = true;
        } else {
            console.warn('⚠️ Polychora not connected to Universal Interaction Engine');
        }
    } else {
        console.warn('⚠️ Universal Interaction Engine not available');
    }
    
    return { audioConnected, interactionConnected };
}

// Test 5: Test WebGL context creation
async function testWebGLContexts() {
    console.log('\n📝 Test 5: Testing WebGL Context Creation...');
    
    const layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
    let contextsCreated = 0;
    
    layers.forEach(layer => {
        const canvasId = `polychora-${layer}-canvas`;
        const canvas = document.getElementById(canvasId);
        
        if (canvas) {
            console.log(`✅ Canvas ${canvasId} exists`);
            
            // Try to get WebGL context
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (gl) {
                console.log(`✅ WebGL context created for ${canvasId}`);
                contextsCreated++;
            } else {
                console.error(`❌ No WebGL context for ${canvasId}`);
            }
        } else {
            console.error(`❌ Canvas ${canvasId} not found`);
        }
    });
    
    console.log(`🔮 WebGL contexts created: ${contextsCreated}/${layers.length}`);
    return contextsCreated;
}

// Run all tests
async function runPolychoraTests() {
    console.log('=' .repeat(60));
    console.log('🔮 POLYCHORA SYSTEM ACTIVATION VERIFICATION');
    console.log('=' .repeat(60));
    
    const system = await testPolychoraImport();
    const physics = await testPhysicsEngine();
    const switchingWorked = await testSystemSwitching();
    const connections = await testUniversalConnections();
    const webglContexts = await testWebGLContexts();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🏁 FINAL RESULTS:');
    console.log(`✅ System Import: ${system ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Physics Engine: ${physics ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ System Switching: ${switchingWorked ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✅ Audio Connection: ${connections.audioConnected ? 'SUCCESS' : 'NEEDS SETUP'}`);
    console.log(`✅ Interaction Connection: ${connections.interactionConnected ? 'SUCCESS' : 'NEEDS SETUP'}`);
    console.log(`✅ WebGL Contexts: ${webglContexts}/5 created`);
    console.log('=' .repeat(60));
    
    const overallSuccess = system && physics && switchingWorked && webglContexts >= 3;
    
    if (overallSuccess) {
        console.log('\n🎉 POLYCHORA SYSTEM ACTIVATION SUCCESSFUL!');
        console.log('The system is ready for use and further enhancement.');
        console.log('\nNext steps:');
        console.log('- Test 4D polytope rendering');
        console.log('- Test physics simulation');
        console.log('- Test glass effect controls');
        console.log('- Add advanced UI controls');
    } else {
        console.error('\n⚠️ SOME ISSUES FOUND');
        console.log('Check the test results above for specific problems.');
    }
    
    return { overallSuccess, system, physics, webglContexts };
}

// Export for browser console
window.runPolychoraTests = runPolychoraTests;
window.testPolychoraImport = testPolychoraImport;
window.testPhysicsEngine = testPhysicsEngine;
window.testSystemSwitching = testSystemSwitching;

console.log('🔮 Polychora test suite loaded. Run window.runPolychoraTests() to start testing.');