import { exec } from 'child_process';
import { platform } from 'os';

/**
 * Ouvre une URL dans le navigateur par défaut
 */
export function openBrowser(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let command: string;

    switch (platform()) {
      case 'win32':
        command = `start "" "${url}"`;
        break;
      case 'darwin':
        command = `open "${url}"`;
        break;
      default:
        command = `xdg-open "${url}"`;
    }

    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
