#!/usr/bin/env node
import { build } from 'vite';
import { execSync } from 'child_process';

async function buildProject() {
  try {
    console.log('Starting Vite build...');
    
    // First attempt: Standard Vite build
    await build({
      logLevel: 'info',
      mode: 'production',
      build: {
        target: 'esnext',
        minify: 'esbuild',
        rollupOptions: {
          output: {
            format: 'es',
            manualChunks: undefined
          }
        }
      }
    });
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Primary build failed:', error.message);
    console.log('🔄 Attempting fallback build methods...');
    
    try {
      // Fallback 1: Install missing dependencies and retry
      console.log('Installing optional dependencies...');
      execSync('npm install --include=optional --force', { stdio: 'inherit' });
      
      await build({
        logLevel: 'info',
        mode: 'production'
      });
      
      console.log('✅ Fallback build completed successfully!');
    } catch (fallbackError) {
      console.error('❌ Fallback build failed:', fallbackError.message);
      
      try {
        // Fallback 2: Use CLI build as last resort
        console.log('🔄 Attempting CLI build...');
        execSync('npx vite build', { stdio: 'inherit' });
        console.log('✅ CLI build completed successfully!');
      } catch (cliError) {
        console.error('❌ All build methods failed:', cliError.message);
        process.exit(1);
      }
    }
  }
}

buildProject();
