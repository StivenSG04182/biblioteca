import { migrate } from './migrate.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  console.log('Running migration...');
  const migrationSuccess = await migrate();

  if (migrationSuccess) {
    console.log('Migration successful, starting server...');
    const serverProcess = spawn('node', [path.join(__dirname, '..', 'index.js')], {
      stdio: 'inherit'
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      process.exit(code);
    });
  } else {
    console.error('Migration failed, not starting server');
    process.exit(1);
  }
}

start();

