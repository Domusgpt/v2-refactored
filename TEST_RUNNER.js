/**
 * TEST RUNNER - Quick command line testing
 * 
 * Usage: Open browser console on index.html and run:
 * await testEverything()
 */

// Import the test validator
import { UltimateSystemValidator } from './src/test/UltimateSystemValidator.js';

/**
 * ULTRA SIMPLE TEST RUNNER - Just run this in the browser console
 */
window.testEverything = async function() {
    console.log('🔥 STARTING ULTIMATE VALIDATION - NO BULLSHIT TESTING');
    
    // Wait for systems to be loaded
    if (!window.universalAudio || !window.universalInteractions) {
        console.log('⚠️ Universal systems not loaded yet, waiting...');
        
        let attempts = 0;
        while ((!window.universalAudio || !window.universalInteractions) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        if (!window.universalAudio || !window.universalInteractions) {
            console.error('❌ CRITICAL: Universal systems failed to load');
            return false;
        }
    }
    
    // Create validator and run tests
    const validator = new UltimateSystemValidator();
    const results = await validator.runUltimateValidation();
    
    // Final summary
    console.log('\n🏁 FINAL RESULTS:');
    console.log(`Success: ${results.success ? '✅ YES' : '❌ NO'}`);
    console.log(`Tests: ${results.passedTests}/${results.totalTests}`);
    console.log(`Success Rate: ${results.successRate}%`);
    
    if (results.criticalFailures.length > 0) {
        console.log('\n💥 CRITICAL FAILURES:');
        results.criticalFailures.forEach(failure => console.log(`  - ${failure}`));
    }
    
    return results;
};

/**
 * QUICK AUDIO TEST - Test just audio reactivity
 */
window.testAudioQuick = async function() {
    console.log('🎵 QUICK AUDIO TEST');
    
    if (!window.universalAudio) {
        console.error('❌ Universal audio not loaded');
        return;
    }
    
    const systems = ['faceted', 'quantum', 'holographic', 'polychora'];
    
    for (const system of systems) {
        console.log(`🎵 Testing ${system} audio...`);
        
        // Switch system
        if (window.switchSystem) {
            window.switchSystem(system);
        }
        
        // Inject bass
        if (window.universalAudio.audioFeatures) {
            window.universalAudio.audioFeatures.bass = 0.9;
            window.universalAudio.audioFeatures.mid = 0.1;
            window.universalAudio.audioFeatures.high = 0.1;
            window.universalAudio.audioFeatures.energy = 0.8;
        }
        
        // Trigger update
        if (window.universalAudio.update) {
            window.universalAudio.update();
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`  ✅ ${system} audio injection complete`);
    }
    
    console.log('🎵 Audio test complete - check visuals for changes');
};

/**
 * QUICK INTERACTION TEST - Test mouse/touch interactions
 */
window.testInteractionsQuick = async function() {
    console.log('🖱️ QUICK INTERACTION TEST');
    
    if (!window.universalInteractions) {
        console.error('❌ Universal interactions not loaded');
        return;
    }
    
    const systems = ['faceted', 'quantum', 'holographic', 'polychora'];
    
    for (const system of systems) {
        console.log(`🖱️ Testing ${system} interactions...`);
        
        // Switch system
        if (window.switchSystem) {
            window.switchSystem(system);
        }
        
        // Simulate mouse movement
        const interactions = window.universalInteractions;
        for (let i = 0; i < 10; i++) {
            interactions.mouse.x = Math.random();
            interactions.mouse.y = Math.random();
            interactions.mouse.intensity = Math.random();
            
            // Simulate click
            if (i === 5) {
                interactions.clickIntensity = 1.0;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`  ✅ ${system} interaction simulation complete`);
    }
    
    console.log('🖱️ Interaction test complete');
};

/**
 * SYSTEM STATUS CHECK - Quick health check
 */
window.checkSystemHealth = function() {
    console.log('🏥 SYSTEM HEALTH CHECK');
    
    const checks = [
        { name: 'Universal Audio', obj: window.universalAudio },
        { name: 'Universal Interactions', obj: window.universalInteractions },
        { name: 'Faceted Engine', obj: window.engine },
        { name: 'Quantum Engine', obj: window.quantumEngine },
        { name: 'Holographic System', obj: window.holographicSystem },
        { name: 'Polychora System', obj: window.polychoraSystem }
    ];
    
    let healthy = 0;
    
    checks.forEach(check => {
        const status = check.obj ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${check.obj ? 'OK' : 'MISSING'}`);
        if (check.obj) healthy++;
    });
    
    console.log(`\nHealth: ${healthy}/${checks.length} systems loaded`);
    
    if (window.universalAudio && window.universalAudio.connectedSystems) {
        console.log(`Audio connections: ${window.universalAudio.connectedSystems.size}`);
    }
    
    if (window.universalInteractions && window.universalInteractions.connectedSystems) {
        console.log(`Interaction connections: ${window.universalInteractions.connectedSystems.size}`);
    }
    
    return healthy === checks.length;
};

// Auto-run health check on load
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('🔥 ULTIMATE TEST RUNNER LOADED');
        console.log('Available commands:');
        console.log('  await testEverything() - Run all tests');
        console.log('  await testAudioQuick() - Quick audio test');
        console.log('  await testInteractionsQuick() - Quick interaction test');
        console.log('  checkSystemHealth() - System health check');
    }, 1000);
});

console.log('🔥 TEST RUNNER READY - Use await testEverything() to start testing');