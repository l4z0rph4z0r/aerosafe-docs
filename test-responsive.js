const { chromium } = require('playwright');

async function testResponsiveness() {
  const browser = await chromium.launch({ headless: true });
  
  const devices = [
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
    { name: 'Tablet', viewport: { width: 768, height: 1024 } },
    { name: 'Mobile', viewport: { width: 375, height: 667 } }
  ];
  
  const pages = [
    { url: 'http://localhost:7112', name: 'Home' },
    { url: 'http://localhost:7112/docs', name: 'Documentation' },
    { url: 'http://localhost:7112/admin/login', name: 'Admin Login' },
    { url: 'http://localhost:7112/blog', name: 'Blog' }
  ];
  
  console.log('🔍 Testing AeroSafe Documentation Responsiveness\n');
  
  for (const device of devices) {
    console.log(`\n📱 Testing on ${device.name} (${device.viewport.width}x${device.viewport.height})`);
    console.log('─'.repeat(50));
    
    const context = await browser.newContext({
      viewport: device.viewport,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    for (const pageInfo of pages) {
      try {
        await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
        
        // Check for common responsive issues
        const issues = [];
        
        // Check for horizontal scrolling
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (hasHorizontalScroll) {
          issues.push('Horizontal scrolling detected');
        }
        
        // Check for overlapping elements
        const hasOverlaps = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          for (let i = 0; i < Math.min(elements.length, 100); i++) {
            const rect = elements[i].getBoundingClientRect();
            if (rect.width > window.innerWidth) {
              return true;
            }
          }
          return false;
        });
        
        if (hasOverlaps) {
          issues.push('Elements wider than viewport');
        }
        
        // Check text readability
        const unreadableText = await page.evaluate(() => {
          const texts = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6');
          for (const text of texts) {
            const styles = window.getComputedStyle(text);
            const fontSize = parseFloat(styles.fontSize);
            if (fontSize < 12 && text.textContent.trim().length > 0) {
              return true;
            }
          }
          return false;
        });
        
        if (unreadableText) {
          issues.push('Text too small (< 12px)');
        }
        
        // Check color contrast
        const contrastIssues = await page.evaluate(() => {
          const getContrastRatio = (rgb1, rgb2) => {
            const getLuminance = (r, g, b) => {
              const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
              });
              return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
            };
            
            const l1 = getLuminance(...rgb1);
            const l2 = getLuminance(...rgb2);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
          };
          
          const parseRGB = (color) => {
            const match = color.match(/\d+/g);
            return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
          };
          
          const elements = document.querySelectorAll('p, span, a, h1, h2, h3, h4, h5, h6');
          for (const el of elements) {
            if (!el.textContent.trim()) continue;
            const styles = window.getComputedStyle(el);
            const color = parseRGB(styles.color);
            const bgColor = parseRGB(styles.backgroundColor || 'rgb(255,255,255)');
            const ratio = getContrastRatio(color, bgColor);
            if (ratio < 4.5) {
              return true;
            }
          }
          return false;
        });
        
        if (contrastIssues) {
          issues.push('Poor color contrast detected');
        }
        
        // Take screenshot
        const screenshotName = `screenshot-${device.name.toLowerCase()}-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        await page.screenshot({ 
          path: screenshotName,
          fullPage: false 
        });
        
        // Report results
        if (issues.length === 0) {
          console.log(`✅ ${pageInfo.name}: No issues found`);
        } else {
          console.log(`⚠️  ${pageInfo.name}: ${issues.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`❌ ${pageInfo.name}: Failed to load (${error.message})`);
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('\n✨ Responsiveness testing complete!');
  console.log('📸 Screenshots saved to current directory\n');
}

// Run the test
testResponsiveness().catch(console.error);