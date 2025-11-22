import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = promisify(exec);

async function buildFrontend() {
  try {
    console.log('Building frontend assets...');
    
    // Change to frontend directory and run build
    const frontendPath = path.join(__dirname, '..', 'frontend');
    const result = await execPromise('npm install && npm run build', {
      cwd: frontendPath,
      env: process.env
    });
    
    console.log('Build output:', result.stdout);
    console.log('Build completed successfully!');
    console.log('Frontend assets built in dist directory.');
  } catch (error) {
    console.error('Error building frontend:', error);
    process.exit(1);
  }
}

buildFrontend();