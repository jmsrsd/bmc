import { chromium } from 'playwright'
import path from 'path'

const routes = [
  '/',
  '/login',
  '/building',
  '/building/lighting',
  '/building/hvac',
  '/building/security',
  '/alarms',
  '/elevators',
  '/energy',
  '/fire',
]

const screenshotsDir = '/home/jmsrsd/src/workspace/bmc/screenshots'

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Navigate to login, enter password
  await page.goto('http://localhost:3001/login')
  await page.fill('input[type="password"]', 'bmc2024')
  await page.click('button[type="submit"]')
  
  // Wait for navigation
  await page.waitForURL('http://localhost:3001/building')

  for (const route of routes) {
    if (route === '/') {
      // Handle root separately - might redirect
      await page.goto('http://localhost:3001/')
      await page.waitForTimeout(500)
    } else {
      await page.goto(`http://localhost:3001${route}`)
    }
    await page.waitForTimeout(1000)
    
    const filename = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
    await page.screenshot({ path: `${screenshotsDir}/${filename}.png`, fullPage: true })
    console.log(`Saved: ${filename}.png`)
  }

  await browser.close()
  console.log('Done!')
}

main().catch(console.error)