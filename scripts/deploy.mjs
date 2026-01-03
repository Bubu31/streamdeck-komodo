import { execSync } from 'child_process';
import { cpSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const PLUGIN_NAME = 'com.komodo.stack-monitor.sdPlugin';

// Chemins
const sourceDir = join(process.cwd(), PLUGIN_NAME);
const destDir = join(homedir(), 'AppData', 'Roaming', 'Elgato', 'StreamDeck', 'Plugins', PLUGIN_NAME);

console.log('🚀 Deploying Komodo Stack Monitor plugin...\n');

// 1. Arrêter Stream Deck
console.log('⏹️  Stopping Stream Deck...');
try {
  execSync('taskkill /IM "StreamDeck.exe" /F', { stdio: 'ignore' });
  // Attendre que le processus se termine
  await new Promise(resolve => setTimeout(resolve, 2000));
} catch {
  console.log('   Stream Deck was not running');
}

// 2. Supprimer l'ancien plugin
console.log('🗑️  Removing old plugin...');
if (existsSync(destDir)) {
  rmSync(destDir, { recursive: true, force: true });
}

// 3. Copier le nouveau plugin
console.log('📁 Copying new plugin...');
cpSync(sourceDir, destDir, { recursive: true });

// 4. Redémarrer Stream Deck
console.log('▶️  Starting Stream Deck...');
try {
  execSync('start "" "%ProgramFiles%\\Elgato\\StreamDeck\\StreamDeck.exe"', {
    shell: 'cmd.exe',
    stdio: 'ignore'
  });
} catch {
  console.log('   Could not start Stream Deck automatically');
}

console.log('\n✅ Done! Plugin deployed successfully.');
console.log(`   Location: ${destDir}`);
