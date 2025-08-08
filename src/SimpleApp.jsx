import { useState } from 'react'
import './SimpleApp.css'

function SimpleApp() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleShorten = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('https://shorten-url-api-40d6.onrender.com/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: url,
          validityPeriod: 30
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setShortUrl(data.shortUrl)
        setError('')
      } else {
        setError(data.message || 'Failed to shorten URL')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    alert('Copied to clipboard!')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>🔗 LinkForge</h1>
          <p>Professional URL Shortener</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="shortener-card">
            <h2>Shorten Your URL</h2>
            
            <div className="input-group">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your URL here..."
                className="url-input"
                disabled={loading}
              />
              <button 
                onClick={handleShorten}
                disabled={loading || !url}
                className="shorten-btn"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </div>

            {error && (
              <div className="error">
                ❌ {error}
              </div>
            )}

            {shortUrl && (
              <div className="result">
                <h3>✅ URL Shortened Successfully!</h3>
                <div className="short-url">
                  <input 
                    type="text" 
                    value={shortUrl} 
                    readOnly 
                    className="result-input"
                  />
                  <button onClick={copyToClipboard} className="copy-btn">
                    Copy
                  </button>
                </div>
                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="test-link">
                  Test Link →
                </a>
              </div>
            )}
          </div>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Generate short URLs in milliseconds</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>Your links are safe and always available</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <h3>Analytics Ready</h3>
              <p>Track clicks and performance</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2025 LinkForge - Professional URL Shortener</p>
        </div>
      </footer>
    </div>
  )
}

export default SimpleApp
