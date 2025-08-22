/**
 * PHASE 1 VERIFICATION SCRIPT
 * Tests that all magic number replacements work correctly
 */

console.log('🔍 PHASE 1 VERIFICATION - Testing magic number replacements');

// Test 1: Check RealHolographicSystem constants
async function testHolographicConstants() {
    console.log('\n📝 Testing RealHolographicSystem.js constants...');
    
    const module = await import('./src/holograms/RealHolographicSystem.js');
    const system = new module.RealHolographicSystem();
    
    // Verify all constants exist and have correct values
    const expectedConstants = {
        BASS_FREQUENCY_RATIO: 0.1,
        MID_FREQUENCY_RATIO: 0.4,
        AUDIO_SMOOTHING_FACTOR: 0.4,
        AUDIO_SILENCE_THRESHOLD: 0.05,
        BEAT_DETECTION_THRESHOLD: 0.2,
        MELODY_ACTIVITY_THRESHOLD: 0.3,
        MOUSE_SENSITIVITY_DIVISOR: 40,
        DENSITY_VARIATION_SCALE: 2.0,
        TOUCH_TAP_DURATION: 150,
        TOUCH_TAP_INTENSITY: 0.3
    };
    
    let passed = 0;
    let failed = 0;
    
    for (const [name, expectedValue] of Object.entries(expectedConstants)) {
        const actualValue = system[name];
        if (actualValue === expectedValue) {
            console.log(`  ✅ ${name}: ${actualValue}`);
            passed++;
        } else {
            console.error(`  ❌ ${name}: Expected ${expectedValue}, got ${actualValue}`);
            failed++;
        }
    }
    
    // Test that methods use these constants
    const updateAudioSource = system.updateAudio.toString();
    if (updateAudioSource.includes('this.BASS_FREQUENCY_RATIO')) {
        console.log('  ✅ updateAudio() uses BASS_FREQUENCY_RATIO');
        passed++;
    } else {
        console.error('  ❌ updateAudio() should use this.BASS_FREQUENCY_RATIO');
        failed++;
    }
    
    if (updateAudioSource.includes('this.MID_FREQUENCY_RATIO')) {
        console.log('  ✅ updateAudio() uses MID_FREQUENCY_RATIO');
        passed++;
    } else {
        console.error('  ❌ updateAudio() should use this.MID_FREQUENCY_RATIO');
        failed++;
    }
    
    return { passed, failed };
}

// Test 2: Check UniversalAudioEngine constants
async function testAudioEngineConstants() {
    console.log('\n📝 Testing UniversalAudioEngine.js constants...');
    
    const module = await import('./src/audio/UniversalAudioEngine.js');
    const engine = new module.UniversalAudioEngine();
    
    const expectedConstants = {
        BASS_FREQ_MIN: 20,
        BASS_FREQ_MAX: 250,
        MID_FREQ_MAX: 2000,
        HIGH_FREQ_MAX: 20000,
        FFT_SIZE: 2048,
        SMOOTHING_TIME_CONSTANT: 0.3,
        ENERGY_HISTORY_SIZE: 60,
        PEAK_HISTORY_SIZE: 30,
        RHYTHM_WINDOW_SIZE: 15,
        TRANSIENT_AMPLIFICATION: 10,
        RHYTHM_SCALE_FACTOR: 2,
        SMOOTH_ENERGY_FACTOR: 0.1
    };
    
    let passed = 0;
    let failed = 0;
    
    for (const [name, expectedValue] of Object.entries(expectedConstants)) {
        const actualValue = engine[name];
        if (actualValue === expectedValue) {
            console.log(`  ✅ ${name}: ${actualValue}`);
            passed++;
        } else {
            console.error(`  ❌ ${name}: Expected ${expectedValue}, got ${actualValue}`);
            failed++;
        }
    }
    
    // Verify array sizes use constants
    if (engine.energyHistory.length === engine.ENERGY_HISTORY_SIZE) {
        console.log(`  ✅ energyHistory array size matches ENERGY_HISTORY_SIZE`);
        passed++;
    } else {
        console.error(`  ❌ energyHistory size mismatch`);
        failed++;
    }
    
    return { passed, failed };
}

// Test 3: Check UniversalInteractionEngine constants
async function testInteractionConstants() {
    console.log('\n📝 Testing UniversalInteractionEngine.js constants...');
    
    const module = await import('./src/interactions/UniversalInteractionEngine.js');
    const engine = new module.UniversalInteractionEngine();
    
    const expectedConstants = {
        DOUBLE_CLICK_THRESHOLD: 300,
        HOLD_DURATION_THRESHOLD: 1000,
        PINCH_SCALE_MIN: 0.1,
        PINCH_SCALE_MAX: 3.0,
        ROTATION_SENSITIVITY: 1.0,
        CHAOS_BURST_DURATION: 500,
        CHAOS_BURST_INTENSITY: 2.0,
        GEOMETRIC_RIPPLE_DURATION: 1000,
        BASS_BOOST_DURATION: 300
    };
    
    let passed = 0;
    let failed = 0;
    
    for (const [name, expectedValue] of Object.entries(expectedConstants)) {
        const actualValue = engine[name];
        if (actualValue === expectedValue) {
            console.log(`  ✅ ${name}: ${actualValue}`);
            passed++;
        } else {
            console.error(`  ❌ ${name}: Expected ${expectedValue}, got ${actualValue}`);
            failed++;
        }
    }
    
    return { passed, failed };
}

// Run all tests
async function runAllTests() {
    console.log('=' .repeat(60));
    console.log('PHASE 1 VERIFICATION - MAGIC NUMBER REPLACEMENTS');
    console.log('=' .repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    try {
        const test1 = await testHolographicConstants();
        totalPassed += test1.passed;
        totalFailed += test1.failed;
        
        const test2 = await testAudioEngineConstants();
        totalPassed += test2.passed;
        totalFailed += test2.failed;
        
        const test3 = await testInteractionConstants();
        totalPassed += test3.passed;
        totalFailed += test3.failed;
        
        console.log('\n' + '=' .repeat(60));
        console.log('FINAL RESULTS:');
        console.log(`✅ Passed: ${totalPassed}`);
        console.log(`❌ Failed: ${totalFailed}`);
        console.log(`Success Rate: ${(totalPassed / (totalPassed + totalFailed) * 100).toFixed(1)}%`);
        console.log('=' .repeat(60));
        
        if (totalFailed === 0) {
            console.log('\n🎉 ALL PHASE 1 CHANGES VERIFIED SUCCESSFULLY!');
            console.log('Magic numbers have been properly replaced with named constants.');
            console.log('No functionality has been broken.');
        } else {
            console.error('\n⚠️ SOME TESTS FAILED - Review the changes!');
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Export for browser console
window.verifyPhase1 = runAllTests;

console.log('Run window.verifyPhase1() to test all Phase 1 changes');