import { build } from 'vite';

async function buildProject() {
  try {
    console.log('Starting Vite build...');
    await build({
      logLevel: 'info',
      mode: 'production',
      build: {
        rollupOptions: {
          // Force use of JavaScript fallback instead of native binary
          external: []
        }
      },
      optimizeDeps: {
        force: true
      }
    });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    console.log('Attempting alternative build approach...');
    
    try {
      // Fallback: try with different Rollup configuration
      await build({
        logLevel: 'info',
        mode: 'production',
        build: {
          rollupOptions: {
            output: {
              format: 'es'
            }
          },
          target: 'esnext',
          minify: false // Disable minification if causing issues
        }
      });
      console.log('✅ Alternative build completed successfully!');
    } catch (fallbackError) {
      console.error('❌ Fallback build also failed:', fallbackError);
      process.exit(1);
    }
  }
}

buildProject();
