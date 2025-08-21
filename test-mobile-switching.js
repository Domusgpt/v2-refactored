const { chromium, devices } = require('playwright');

(async () => {
  console.log('🧪 TESTING MOBILE SYSTEM SWITCHING...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(devices['iPhone 13']);
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('❌') || msg.text().includes('✅') || msg.text().includes('📱')) {
      console.log(`[MOBILE] ${msg.text()}`);
    }
  });
  
  console.log('📱 Loading page...');
  await page.goto('http://localhost:8144');
  
  console.log('📱 Waiting for module ready...');
  try {
    await page.waitForFunction(() => window.moduleReady === true, { timeout: 15000 });
    console.log('✅ Module loaded successfully');
  } catch (error) {
    console.log('❌ Module failed to load:', error.message);
    await browser.close();
    return;
  }
  
  // Test initial state
  console.log('📱 Testing initial faceted system...');
  const facetedInfo = await page.evaluate(() => {
    return {
      currentSystem: window.currentSystem,
      engine: window.engine ? {
        visualizers: window.engine.visualizers?.length || 0,
        hasCanvas: window.engine.visualizers?.[0]?.canvas?.id || 'none'
      } : 'missing'
    };
  });
  console.log('📊 Faceted state:', JSON.stringify(facetedInfo, null, 2));
  
  // Test switching to quantum
  console.log('📱 TESTING QUANTUM SWITCH...');
  try {
    await page.click('[data-system="quantum"]');
    await page.waitForTimeout(3000);
    
    const quantumInfo = await page.evaluate(() => {
      return {
        currentSystem: window.currentSystem,
        quantumEngine: window.quantumEngine ? {
          visualizers: window.quantumEngine.visualizers?.length || 0,
          isActive: window.quantumEngine.isActive,
          hasCanvas: window.quantumEngine.visualizers?.[0]?.canvas?.id || 'none'
        } : 'missing'
      };
    });
    console.log('📊 Quantum state:', JSON.stringify(quantumInfo, null, 2));
    
    if (quantumInfo.quantumEngine === 'missing' || quantumInfo.quantumEngine.visualizers === 0) {
      console.log('❌ QUANTUM SWITCH FAILED - No engine or visualizers');
    } else {
      console.log('✅ QUANTUM SWITCH SUCCEEDED');
    }
  } catch (error) {
    console.log('❌ Quantum switch error:', error.message);
  }
  
  // Test parameter change
  console.log('📱 TESTING PARAMETER CHANGE...');
  try {
    await page.evaluate(() => {
      const slider = document.getElementById('gridDensity');
      if (slider) {
        slider.value = 50;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);
    console.log('✅ Parameter test completed');
  } catch (error) {
    console.log('❌ Parameter test failed:', error.message);
  }
  
  // Test switching to holographic
  console.log('📱 TESTING HOLOGRAPHIC SWITCH...');
  try {
    await page.click('[data-system="holographic"]');
    await page.waitForTimeout(3000);
    
    const holoInfo = await page.evaluate(() => {
      return {
        currentSystem: window.currentSystem,
        holographicSystem: window.holographicSystem ? {
          isActive: window.holographicSystem.isActive,
          isRunning: window.holographicSystem.isRunning,
          hasVisualizers: !!window.holographicSystem.visualizers
        } : 'missing'
      };
    });
    console.log('📊 Holographic state:', JSON.stringify(holoInfo, null, 2));
    
    if (holoInfo.holographicSystem === 'missing') {
      console.log('❌ HOLOGRAPHIC SWITCH FAILED - No engine');
    } else {
      console.log('✅ HOLOGRAPHIC SWITCH SUCCEEDED');
    }
  } catch (error) {
    console.log('❌ Holographic switch error:', error.message);
  }
  
  console.log('📱 Mobile test completed');
  await browser.close();
})();