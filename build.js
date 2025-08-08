import { build } from 'vite';

async function buildProject() {
  try {
    console.log('Starting Vite build...');
    await build({
      // Vite build configuration
      logLevel: 'info',
      mode: 'production'
    });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject();
