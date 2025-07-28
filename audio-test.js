const puppeteer = require('puppeteer');

async function testAudioSimulation() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream'
            ]
        });

        const page = await browser.newPage();
        
        // Grant microphone permissions
        const context = browser.defaultBrowserContext();
        await context.overridePermissions('http://localhost:8000', ['microphone']);
        
        await page.goto('http://localhost:8000/pitch-trainer.html');
        
        console.log('🎤 Audio Simulation Test Results');
        console.log('================================');
        
        // Select 60 second timer
        await page.click('[data-time="60"]');
        
        // Start recording
        await page.click('#startButton');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate transcript input (since we can't use real audio)
        const samplePitch = `Hallo, ich bin Klaus Müller von der Firma InnovateTech. 
        Wir helfen Unternehmen dabei, ihre Umsätze um 30% zu steigern durch innovative 
        Automatisierungslösungen. Äh, unsere Software reduziert manuelle Prozesse und 
        also verbessert die Effizienz erheblich. Kontaktieren Sie uns heute noch für 
        eine kostenlose Beratung und erleben Sie, wie Ihr Unternehmen wachsen kann.`;
        
        // Inject transcript directly into the page
        await page.evaluate((transcript) => {
            window.transcript = transcript;
            document.getElementById('transcriptBox').innerHTML = transcript;
        }, samplePitch);
        
        console.log('✅ Sample transcript injected');
        console.log(`📝 Content: "${samplePitch.substring(0, 60)}..."`);
        
        // Stop recording after 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.click('#stopButton');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get analysis results
        const score = await page.$eval('#scoreNumber', el => el.textContent);
        const analysisItems = await page.$$eval('.analysis-item', items => 
            items.map(item => item.textContent)
        );
        const recommendations = await page.$$eval('#recommendationsList li', items => 
            items.map(item => item.textContent)
        );
        
        console.log('\n📊 Analysis Results:');
        console.log(`🎯 Overall Score: ${score}`);
        
        console.log('\n📈 Detailed Analysis:');
        analysisItems.forEach(item => {
            console.log(`   ${item}`);
        });
        
        console.log('\n💡 Recommendations:');
        recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
        });
        
        // Test copy functionality
        const copyText = await page.evaluate(() => {
            const analysis = analyzeTranscript();
            const score = calculateScore(analysis);
            const now = new Date();
            return `Score: ${score}% | Items: ${analysis.items.length} | Recommendations: ${analysis.recommendations.length}`;
        });
        
        console.log(`\n📋 Copy Function: ${copyText}`);
        
        // Test different timer values
        console.log('\n⏱️  Timer Test:');
        await page.click('#retryButton');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const timerOptions = [30, 60, 90, 120];
        for (const time of timerOptions) {
            await page.click(`[data-time="${time}"]`);
            const selectedTime = await page.$eval('#selectedTime', el => el.textContent);
            console.log(`   ${time}s timer: ${selectedTime === time.toString() ? '✅' : '❌'}`);
        }
        
        console.log('\n✨ Audio Test Result: SIMULATION SUCCESSFUL');
        console.log('   (Note: Real audio testing requires microphone access in browser)');
        
    } catch (error) {
        console.error('❌ Audio test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testAudioSimulation();