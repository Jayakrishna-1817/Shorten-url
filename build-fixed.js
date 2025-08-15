#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Building URL Shortener with FULL functionality...')

// Create dist directory
const distDir = path.join(__dirname, 'dist')
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true })
}
fs.mkdirSync(distDir, { recursive: true })

// Read CSS
const css = fs.readFileSync(path.join(__dirname, 'src/ModernApp.css'), 'utf-8')

// Create working HTML with full React app
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
        
        // Icon Components
        const Link2 = ({ size = 24 }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 15 6-6"/>
                <path d="m21 2-2 2"/>
                <path d="m15 10 2-2"/>
                <path d="m18.5 5.5-3 3"/>
            </svg>
        );
        
        const Zap = ({ size = 20 }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
            </svg>
        );
        
        const BarChart3 = ({ size = 20 }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                <path d="M7 16V9"/>
                <path d="M12 16V6"/>
                <path d="M17 16v-3"/>
            </svg>
        );

        const Copy = ({ size = 16 }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
        );

        const ExternalLink = ({ size = 16 }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6"/>
                <path d="m10 14 11-11"/>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            </svg>
        );

        const Trash2 = ({ size = 16 }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" x2="10" y1="11" y2="17"/>
                <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
        );

        // Header Component
        const Header = ({ activeTab, setActiveTab }) => (
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <Link2 size={32} />
                        <div className="logo-text">
                            <h1>LinkForge</h1>
                            <span>Professional URL Shortener</span>
                        </div>
                    </div>
                    
                    <nav className="nav-tabs">
                        <button
                            onClick={() => setActiveTab('shortener')}
                            className={\`nav-tab rounded-btn \${activeTab === 'shortener' ? 'active' : ''}\`}
                        >
                            <Zap size={20} />
                            <span>Shorten URLs</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={\`nav-tab rounded-btn \${activeTab === 'analytics' ? 'active' : ''}\`}
                        >
                            <BarChart3 size={20} />
                            <span>Analytics</span>
                        </button>
                    </nav>
                </div>
            </header>
        );

        // URL Shortener Page Component
        const URLShortenerPage = ({ onUrlShortened }) => {
            const [urls, setUrls] = useState([{ url: '', validity: 'never', customCode: '' }]);
            const [shortenedUrls, setShortenedUrls] = useState([]);
            const [loading, setLoading] = useState(false);
            const [notification, setNotification] = useState(null);

            const validityOptions = [
                { value: '5', label: '5 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '1440', label: '1 day' },
                { value: '10080', label: '1 week' },
                { value: '43200', label: '1 month' },
                { value: 'never', label: 'Never expires' }
            ];

            const showNotification = (message, type = 'success') => {
                setNotification({ message, type });
                setTimeout(() => setNotification(null), 3000);
            };

            const addUrlField = () => {
                setUrls([...urls, { url: '', validity: 'never', customCode: '' }]);
            };

            const removeUrlField = (index) => {
                if (urls.length > 1) {
                    setUrls(urls.filter((_, i) => i !== index));
                }
            };

            const updateUrl = (index, field, value) => {
                const newUrls = [...urls];
                newUrls[index][field] = value;
                setUrls(newUrls);
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                const validUrls = urls.filter(item => item.url.trim());
                
                if (validUrls.length === 0) {
                    showNotification('Please enter at least one URL', 'error');
                    return;
                }

                setLoading(true);

                try {
                    const promises = validUrls.map(async (urlItem) => {
                        const payload = {
                            url: urlItem.url.trim(),
                            validity: urlItem.validity === 'never' ? null : parseInt(urlItem.validity)
                        };

                        if (urlItem.customCode.trim()) {
                            payload.customCode = urlItem.customCode.trim();
                        }

                        const response = await fetch(\`\${API_BASE_URL}/api/urls\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        const data = await response.json();
                        
                        if (response.ok) {
                            return {
                                ...data,
                                originalUrl: urlItem.url,
                                shortUrl: \`\${API_BASE_URL}/\${data.shortCode}\`,
                                validity: urlItem.validity
                            };
                        } else {
                            throw new Error(data.error || 'Failed to shorten URL');
                        }
                    });

                    const results = await Promise.all(promises);
                    setShortenedUrls(results);
                    showNotification(\`Successfully shortened \${results.length} URL(s)!\`);
                    if (onUrlShortened) onUrlShortened();
                    
                    // Reset form
                    setUrls([{ url: '', validity: 'never', customCode: '' }]);
                    
                } catch (error) {
                    console.error('Error:', error);
                    showNotification(error.message || 'Error shortening URLs', 'error');
                } finally {
                    setLoading(false);
                }
            };

            const copyToClipboard = (text) => {
                navigator.clipboard.writeText(text);
                showNotification('Copied to clipboard!');
            };

            const deleteUrl = async (shortCode) => {
                try {
                    const response = await fetch(\`\${API_BASE_URL}/api/urls/\${shortCode}\`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        setShortenedUrls(shortenedUrls.filter(url => url.shortCode !== shortCode));
                        showNotification('URL deleted successfully!');
                        if (onUrlShortened) onUrlShortened();
                    } else {
                        showNotification('Error deleting URL', 'error');
                    }
                } catch (error) {
                    showNotification('Error deleting URL', 'error');
                }
            };

            return (
                <div className="url-shortener-page">
                    {notification && (
                        <div className={\`notification \${notification.type}\`}>
                            {notification.message}
                        </div>
                    )}

                    <div className="form-section">
                        <form onSubmit={handleSubmit} className="url-form">
                            {urls.map((urlItem, index) => (
                                <div key={index} className="url-input-group">
                                    <div className="input-row">
                                        <input
                                            type="url"
                                            placeholder="Enter your URL here..."
                                            value={urlItem.url}
                                            onChange={(e) => updateUrl(index, 'url', e.target.value)}
                                            className="url-input"
                                            required
                                        />
                                        
                                        <select
                                            value={urlItem.validity}
                                            onChange={(e) => updateUrl(index, 'validity', e.target.value)}
                                            className="validity-select"
                                        >
                                            {validityOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Custom code (optional)"
                                            value={urlItem.customCode}
                                            onChange={(e) => updateUrl(index, 'customCode', e.target.value)}
                                            className="custom-code-input"
                                        />

                                        {urls.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeUrlField(index)}
                                                className="remove-btn"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={addUrlField}
                                    className="add-url-btn"
                                    disabled={loading}
                                >
                                    + Add Another URL
                                </button>

                                <button
                                    type="submit"
                                    className="shorten-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Shortening...' : 'Shorten URLs'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {shortenedUrls.length > 0 && (
                        <div className="results-section">
                            <h3>Your Shortened URLs</h3>
                            <div className="results-list">
                                {shortenedUrls.map((item) => (
                                    <div key={item.shortCode} className="result-item">
                                        <div className="result-content">
                                            <div className="original-url">
                                                <span className="label">Original:</span>
                                                <span className="url">{item.originalUrl}</span>
                                            </div>
                                            <div className="short-url">
                                                <span className="label">Short URL:</span>
                                                <a href={item.shortUrl} target="_blank" rel="noopener noreferrer" className="url">
                                                    {item.shortUrl}
                                                </a>
                                            </div>
                                            <div className="validity-info">
                                                <span className="label">Expires:</span>
                                                <span className="validity">
                                                    {item.validity === 'never' ? 'Never' : \`In \${validityOptions.find(opt => opt.value === item.validity)?.label}\`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="result-actions">
                                            <button 
                                                onClick={() => window.open(item.shortUrl, '_blank')}
                                                className="action-btn"
                                                title="Open URL"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                            <button 
                                                onClick={() => copyToClipboard(item.shortUrl)}
                                                className="action-btn"
                                                title="Copy URL"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteUrl(item.shortCode)}
                                                className="action-btn delete-btn"
                                                title="Delete URL"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        // Analytics Page Component
        const AnalyticsPage = () => {
            const [analytics, setAnalytics] = useState([]);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                fetchAnalytics();
            }, []);

            const fetchAnalytics = async () => {
                try {
                    const response = await fetch(\`\${API_BASE_URL}/api/analytics\`);
                    const data = await response.json();
                    setAnalytics(data);
                } catch (error) {
                    console.error('Error fetching analytics:', error);
                } finally {
                    setLoading(false);
                }
            };

            if (loading) {
                return <div className="loading">Loading analytics...</div>;
            }

            if (analytics.length === 0) {
                return (
                    <div className="empty-state">
                        <h3>No URLs created yet</h3>
                        <p>Create some short URLs to see analytics here!</p>
                    </div>
                );
            }

            return (
                <div className="analytics-page">
                    <h2>URL Analytics</h2>
                    <div className="analytics-list">
                        {analytics.map((item) => (
                            <div key={item.shortCode} className="analytics-item">
                                <div className="analytics-content">
                                    <div className="url-info">
                                        <div className="short-url">
                                            <strong>{API_BASE_URL}/{item.shortCode}</strong>
                                        </div>
                                        <div className="original-url">{item.originalUrl}</div>
                                    </div>
                                    <div className="stats">
                                        <div className="stat">
                                            <span className="stat-value">{item.clicks || 0}</span>
                                            <span className="stat-label">Clicks</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">
                                                {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}
                                            </span>
                                            <span className="stat-label">Expires</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        // Main App Component
        const App = () => {
            const [activeTab, setActiveTab] = useState('shortener');
            const [refreshKey, setRefreshKey] = useState(0);

            const handleUrlShortened = () => {
                setRefreshKey(prev => prev + 1);
            };

            return (
                <div className="app">
                    <Header activeTab={activeTab} setActiveTab={setActiveTab} />
                    
                    <main className="main-content">
                        {activeTab === 'shortener' ? (
                            <URLShortenerPage onUrlShortened={handleUrlShortened} />
                        ) : (
                            <AnalyticsPage key={refreshKey} />
                        )}
                    </main>
                </div>
            );
        };
        
        // Render the app
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(distDir, 'index.html'), html);

console.log('✅ Build complete! Created dist/index.html with FULL React app');
console.log('📦 Bundle size: ~' + Math.round(html.length / 1024) + 'KB');
console.log('🚀 Ready for deployment with ALL features!');
