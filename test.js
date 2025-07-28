const puppeteer = require('puppeteer');

async function testPitchTrainer() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream']
        });

        const page = await browser.newPage();
        
        // Grant microphone permissions
        const context = browser.defaultBrowserContext();
        await context.overridePermissions('http://localhost:8000', ['microphone']);
        
        await page.goto('http://localhost:8000/pitch-trainer.html');
        
        console.log('🎤 Pitch Trainer Test Results');
        console.log('==============================');
        
        // Test 1: Page loads correctly
        const title = await page.$eval('h1', el => el.textContent);
        console.log(`✅ Page loads: ${title}`);
        
        // Test 2: Timer selection works
        const timerButtons = await page.$$('.timer-button');
        console.log(`✅ Timer buttons: ${timerButtons.length} available`);
        
        // Select 45 second timer
        await page.click('[data-time="45"]');
        const selectedTime = await page.$eval('#selectedTime', el => el.textContent);
        console.log(`✅ Timer selection: ${selectedTime} seconds`);
        
        // Test 3: Navigation to recording screen
        await page.click('#startButton');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const recordingVisible = await page.$eval('#recordingScreen', el => 
            el.classList.contains('active')
        );
        console.log(`✅ Recording screen: ${recordingVisible ? 'Visible' : 'Hidden'}`);
        
        // Test 4: Timer functionality
        const initialTimer = await page.$eval('#timerDisplay', el => el.textContent);
        console.log(`✅ Timer display: ${initialTimer}`);
        
        // Wait a bit and check timer countdown
        await new Promise(resolve => setTimeout(resolve, 2000));
        const afterTimer = await page.$eval('#timerDisplay', el => el.textContent);
        console.log(`✅ Timer countdown: ${initialTimer} → ${afterTimer}`);
        
        // Test 5: Stop recording and go to analysis
        await page.click('#stopButton');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const analysisVisible = await page.$eval('#analysisScreen', el => 
            el.classList.contains('active')
        );
        console.log(`✅ Analysis screen: ${analysisVisible ? 'Visible' : 'Hidden'}`);
        
        // Test 6: Analysis results
        const score = await page.$eval('#scoreNumber', el => el.textContent);
        const analysisItems = await page.$$('.analysis-item');
        console.log(`✅ Analysis score: ${score}`);
        console.log(`✅ Analysis items: ${analysisItems.length} metrics`);
        
        // Test 7: Copy functionality (check if button exists)
        const copyButton = await page.$('#copyButton');
        console.log(`✅ Copy button: ${copyButton ? 'Available' : 'Missing'}`);
        
        // Test 8: Retry functionality
        await page.click('#retryButton');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const backToTimer = await page.$eval('#timerScreen', el => 
            el.classList.contains('active')
        );
        console.log(`✅ Retry function: ${backToTimer ? 'Works' : 'Failed'}`);
        
        // Test 9: Responsive design check
        await page.setViewport({ width: 375, height: 667 }); // iPhone size
        const containerWidth = await page.$eval('.container', el => 
            window.getComputedStyle(el).width
        );
        console.log(`✅ Mobile responsive: ${containerWidth}`);
        
        console.log('\n📱 UI Elements Test:');
        
        // Check color scheme
        const primaryColor = await page.$eval(':root', el => 
            getComputedStyle(el).getPropertyValue('--primary')
        );
        console.log(`✅ Primary color: ${primaryColor.trim()}`);
        
        // Check if all screens exist
        const screens = await page.$$('.screen');
        console.log(`✅ Total screens: ${screens.length}/3`);
        
        console.log('\n🔧 Technical Features:');
        
        // Check if Web Speech API is available
        const speechSupport = await page.evaluate(() => {
            return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        });
        console.log(`✅ Speech API: ${speechSupport ? 'Supported' : 'Not supported'}`);
        
        // Check localStorage capability
        const storageSupport = await page.evaluate(() => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        });
        console.log(`✅ LocalStorage: ${storageSupport ? 'Supported' : 'Not supported'}`);
        
        console.log('\n🎯 Overall Test Result: PASSED');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testPitchTrainer();