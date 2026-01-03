import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const imgsDir = join(rootDir, 'com.komodo.stack-monitor.sdPlugin', 'imgs');

async function convertSvgToPng(svgPath, pngPath, size) {
  const svgBuffer = readFileSync(svgPath);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(pngPath);
  console.log(`Created: ${pngPath} (${size}x${size})`);
}

async function main() {
  console.log('Converting SVG icons to PNG...\n');

  // Plugin icon
  const pluginSvg = join(imgsDir, 'plugin-icon.svg');
  if (existsSync(pluginSvg)) {
    await convertSvgToPng(pluginSvg, join(imgsDir, 'plugin-icon.png'), 144);
    await convertSvgToPng(pluginSvg, join(imgsDir, 'plugin-icon@2x.png'), 288);
  }

  // Action icon
  const actionSvg = join(imgsDir, 'action-icon.svg');
  if (existsSync(actionSvg)) {
    await convertSvgToPng(actionSvg, join(imgsDir, 'action-icon.png'), 40);
    await convertSvgToPng(actionSvg, join(imgsDir, 'action-icon@2x.png'), 80);
  }

  console.log('\nDone!');
}

main().catch(console.error);
