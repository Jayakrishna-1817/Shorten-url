#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Building URL Shortener with simple bundler...')

// Create dist directory
const distDir = path.join(__dirname, 'dist')
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true })
}
fs.mkdirSync(distDir, { recursive: true })

// Read and bundle the React app
const mainJsx = fs.readFileSync(path.join(__dirname, 'src/NoAnimationBulkApp.jsx'), 'utf-8')
const css = fs.readFileSync(path.join(__dirname, 'src/ModernApp.css'), 'utf-8')

// Create HTML with inline CSS and React CDN
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkForge - URL Shortener</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>${css}</style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        // API Configuration
        const API_BASE_URL = 'https://shorten-url-backend-o3on.onrender.com';
        
        // Lucide Icons as simple SVGs
        const Link2 = () => React.createElement('svg', {width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2}, 
            React.createElement('path', {d: 'm9 15 6-6'}),
            React.createElement('path', {d: 'm21 2-2 2'}),
            React.createElement('path', {d: 'm15 10 2-2'}),
            React.createElement('path', {d: 'm18.5 5.5-3 3'}),
            React.createElement('path', {d: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'})
        );
        
        const Copy = () => React.createElement('svg', {width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2}, 
            React.createElement('rect', {width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2}),
            React.createElement('path', {d: 'm4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'})
        );

        // Simple URL Shortener Component
        const URLShortener = () => {
            const [url, setUrl] = useState('');
            const [shortUrl, setShortUrl] = useState('');
            const [loading, setLoading] = useState(false);
            
            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!url) return;
                
                setLoading(true);
                try {
                    const response = await fetch(\`\${API_BASE_URL}/api/urls\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ originalUrl: url, validityPeriod: 30 })
                    });
                    
                    const data = await response.json();
                    if (data.shortUrl) {
                        setShortUrl(data.shortUrl);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    setShortUrl('Error creating short URL');
                }
                setLoading(false);
            };
            
            return React.createElement('div', { className: 'container' }, [
                React.createElement('header', { className: 'header', key: 'header' }, [
                    React.createElement('div', { className: 'header-content', key: 'content' }, [
                        React.createElement('div', { className: 'logo', key: 'logo' }, [
                            React.createElement(Link2, { key: 'icon' }),
                            React.createElement('span', { key: 'text' }, 'LinkForge')
                        ]),
                        React.createElement('p', { key: 'desc' }, 'Transform long URLs into short, shareable links')
                    ])
                ]),
                React.createElement('main', { className: 'main-content', key: 'main' }, [
                    React.createElement('div', { className: 'url-form-container', key: 'form' }, [
                        React.createElement('form', { onSubmit: handleSubmit, key: 'form-el' }, [
                            React.createElement('div', { className: 'input-group', key: 'input' }, [
                                React.createElement('input', {
                                    key: 'url-input',
                                    type: 'url',
                                    placeholder: 'Enter your URL here...',
                                    value: url,
                                    onChange: (e) => setUrl(e.target.value),
                                    className: 'url-input'
                                }),
                                React.createElement('button', {
                                    key: 'submit',
                                    type: 'submit',
                                    disabled: loading,
                                    className: 'shorten-btn'
                                }, loading ? 'Shortening...' : 'Shorten URL')
                            ])
                        ])
                    ]),
                    shortUrl && React.createElement('div', { className: 'result-container', key: 'result' }, [
                        React.createElement('h3', { key: 'title' }, 'Your Short URL:'),
                        React.createElement('div', { className: 'short-url-result', key: 'url' }, [
                            React.createElement('a', { href: shortUrl, target: '_blank', key: 'link' }, shortUrl),
                            React.createElement('button', {
                                key: 'copy',
                                onClick: () => navigator.clipboard.writeText(shortUrl),
                                className: 'copy-btn'
                            }, React.createElement(Copy))
                        ])
                    ])
                ])
            ]);
        };
        
        // Render the app
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(URLShortener));
    </script>
</body>
</html>`

fs.writeFileSync(path.join(distDir, 'index.html'), html)

console.log('✅ Build complete! Created dist/index.html with embedded React app')
console.log('📦 Bundle size: ~' + Math.round(html.length / 1024) + 'KB')
console.log('🚀 Ready for deployment!')
