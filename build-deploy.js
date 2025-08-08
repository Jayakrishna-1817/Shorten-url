#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs';

async function deploymentBuild() {
  console.log('🚀 Creating deployment-safe build...');
  
  try {
    // Step 1: Clean build
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    
    // Step 2: Build with Vite
    console.log('📦 Building with Vite...');
    execSync('npx vite build', { 
      stdio: 'inherit',
      timeout: 120000,
      env: {
        ...process.env,
        ROLLUP_NO_NATIVE: '1',
        NODE_ENV: 'production'
      }
    });
    
    // Step 3: Rename and verify
    if (existsSync('dist/index.dev.html')) {
      const content = readFileSync('dist/index.dev.html', 'utf8');
      writeFileSync('dist/index.html', content);
      rmSync('dist/index.dev.html', { force: true });
      console.log('✅ Renamed index.dev.html to index.html');
    }
    
    // Step 4: Verify no JSX references
    const htmlContent = readFileSync('dist/index.html', 'utf8');
    if (htmlContent.includes('/src/') || htmlContent.includes('.jsx')) {
      console.error('❌ CRITICAL: Built HTML still contains JSX references!');
      console.log('HTML content:', htmlContent);
      process.exit(1);
    }
    
    // Step 5: Copy to root as backup
    const distContent = readFileSync('dist/index.html', 'utf8');
    writeFileSync('index.html', distContent);
    
    console.log('✅ Deployment build completed successfully!');
    console.log('📋 Built files:');
    try {
      execSync('Get-ChildItem dist/ | Format-Table', { stdio: 'inherit', shell: 'powershell.exe' });
    } catch (e) {
      console.log('Files in dist:', require('fs').readdirSync('dist'));
    }
    
  } catch (error) {
    console.error('❌ Deployment build failed:', error.message);
    process.exit(1);
  }
}

deploymentBuild();
