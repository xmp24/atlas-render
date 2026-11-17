import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
const [,, comp, prefix, ...frames] = process.argv;
const serveUrl = './build';
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id: comp, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}});
for (const f of frames) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: +f, output: `${prefix}${String(f).padStart(4,'0')}.png`, puppeteerInstance: browser, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 300000});
  console.log('frame', f, ((Date.now()-t0)/1000).toFixed(1)+'s');
}
await browser.close({silent: true});
