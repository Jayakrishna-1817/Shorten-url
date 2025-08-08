#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, rmSync, cpSync } from 'fs';

async function rootBuild() {
  console.log('🚀 Building directly to root for Vercel...');
  
  try {
    // Step 1: Clean any previous builds
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true, force: true });
    }
    if (existsSync('assets')) {
      rmSync('assets', { recursive: true, force: true });  
    }
    
    // Step 2: Build with Vite to dist
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
    
    // Step 3: Move everything to root
    if (existsSync('dist/index.dev.html')) {
      const content = readFileSync('dist/index.dev.html', 'utf8');
      writeFileSync('index.html', content);
    } else if (existsSync('dist/index.html')) {
      const content = readFileSync('dist/index.html', 'utf8');
      writeFileSync('index.html', content);
    }
    
    // Step 4: Copy assets to root
    if (existsSync('dist/assets')) {
      cpSync('dist/assets', 'assets', { recursive: true });
    }
    
    // Step 5: Verify final output
    if (existsSync('index.html')) {
      const htmlContent = readFileSync('index.html', 'utf8');
      console.log('📋 Final HTML references:');
      console.log('- Contains /assets/:', htmlContent.includes('/assets/'));
      console.log('- Contains /src/:', htmlContent.includes('/src/'));
      console.log('- Contains .jsx:', htmlContent.includes('.jsx'));
      
      if (htmlContent.includes('/src/') || htmlContent.includes('.jsx')) {
        console.error('❌ CRITICAL: Root HTML still contains source references!');
        process.exit(1);
      }
    }
    
    console.log('✅ Root build completed successfully!');
    console.log('📁 Files in root now:');
    try {
      execSync('Get-ChildItem . -Name | Where-Object {$_ -match "\\.(html|js|css)$|^assets$"}', { stdio: 'inherit', shell: 'powershell.exe' });
    } catch (e) {
      console.log('Built files ready for Vercel');
    }
    
  } catch (error) {
    console.error('❌ Root build failed:', error.message);
    process.exit(1);
  }
}

rootBuild();
