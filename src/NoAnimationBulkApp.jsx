import { useState, useEffect } from 'react'
import { 
  Link2, Zap, BarChart3, Globe, Calendar, MousePointer, 
  CheckCircle, Copy, ExternalLink, Shield, Clock, Trash2,
  TrendingUp, Users, Target, Award, ArrowRight, Star,
  Activity, Eye, Download, Settings, Filter, Search,
  AlertCircle
} from 'lucide-react'
import './ModernApp.css'

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
          className={`nav-tab rounded-btn ${activeTab === 'shortener' ? 'active' : ''}`}
        >
          <Zap size={20} />
          <span>Shorten URLs</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`nav-tab rounded-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          <span>Analytics</span>
        </button>
      </nav>
    </div>
  </header>
)

const URLShortenerPage = ({ onUrlShortened }) => {
  const [urls, setUrls] = useState([{ url: '', validity: '30', customCode: '' }])
  const [shortenedUrls, setShortenedUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const validityOptions = [
    { value: '5', label: '5 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '1440', label: '24 hours' },
    { value: '10080', label: '7 days' },
    { value: '43200', label: '30 days' }
  ]

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', validity: '30', customCode: '' }])
    }
  }

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls]
    newUrls[index][field] = value
    setUrls(newUrls)
  }

  const removeUrl = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index)
      setUrls(newUrls)
    }
  }

  const shortenUrls = async () => {
    const validUrls = urls.filter(item => item.url.trim())
    if (validUrls.length === 0) {
      showNotification('Please enter at least one valid URL', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('https://shorten-url-api-40d6.onrender.com/api/urls/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: validUrls.map(item => ({
            url: item.url.trim(),
            customCode: item.customCode || undefined,
            validity: parseInt(item.validity) || 30
          }))
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create URLs')
      }

      if (data.success) {
        const newShortenedUrls = data.results.filter(result => result.success).map(result => ({
          originalUrl: result.originalUrl,
          shortUrl: result.shortLink,
          customCode: result.shortcode,
          createdAt: new Date(result.createdAt),
          expiresAt: new Date(result.expiry),
          clicks: 0,
          isValid: true,
          validityMinutes: parseInt(result.validity) || 30
        }))
        
        setShortenedUrls(prev => [...newShortenedUrls, ...prev])
        newShortenedUrls.forEach(url => onUrlShortened(url))
        
        const failedCount = data.failed
        if (failedCount > 0) {
          showNotification(`${data.successful} URL(s) shortened successfully, ${failedCount} failed`, 'warning')
        } else {
          showNotification(`Successfully shortened ${data.successful} URL(s)!`)
        }
        
        setUrls([{ url: '', validity: '30', customCode: '' }])
      } else {
        throw new Error('Bulk URL creation failed')
      }
      
    } catch (error) {
      console.error('Bulk URL creation error:', error)
      showNotification(error.message || 'Failed to shorten URLs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showNotification('Copied to clipboard!')
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="bulk-form-header">
          <h2 style={{color: 'black'}}>Enter URLs to Shorten</h2>
          <p style={{color: 'black'}}>Create short links for up to 5 URLs at once. Set expiration times and optional short codes.</p>
        </div>

        <div className="bulk-url-form">
          {urls.map((item, index) => (
            <div key={index} className="url-input-row enhanced">
              <div className="input-group">
                <label className="input-label" style={{color: 'black'}}>URL {index + 1}</label>
                <input
                  type="text"
                  placeholder="https://example.com/very-long-url"
                  value={item.url}
                  onChange={(e) => updateUrl(index, 'url', e.target.value)}
                  className="bulk-url-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{color: 'black'}}>Validity</label>
                <select
                  value={item.validity}
                  onChange={(e) => updateUrl(index, 'validity', e.target.value)}
                  className="validity-select"
                >
                  {validityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" style={{color: 'black'}}>Custom Code</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={item.customCode}
                  onChange={(e) => updateUrl(index, 'customCode', e.target.value)}
                  className="custom-code-input"
                />
              </div>

              <div className="input-group">
                <button
                  onClick={() => index === urls.length - 1 ? addUrlField() : removeUrl(index)}
                  className="action-btn rounded-btn"
                  disabled={loading}
                  title={index === urls.length - 1 ? 'Add URL' : 'Remove URL'}
                >
                  {index === urls.length - 1 ? '+' : '×'}
                </button>
              </div>
            </div>
          ))}

          {urls.length < 5 && (
            <button onClick={addUrlField} className="add-url-btn rounded-btn" disabled={loading}>
              + Add Another URL ({urls.length} of 5)
            </button>
          )}

          <button 
            onClick={shortenUrls} 
            disabled={loading || urls.every(item => !item.url.trim())}
            className="bulk-shorten-btn rounded-btn"
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Shortening URLs...</span>
              </>
            ) : (
              <>
                <Zap size={20} />
                <span>Shorten {urls.filter(item => item.url.trim()).length} URL{urls.filter(item => item.url.trim()).length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>

        {shortenedUrls.length > 0 && (
          <div className="results-section">
            <h3 style={{color: 'black'}}>Your Shortened URLs</h3>
            <div className="results-list">
              {shortenedUrls.map((item, index) => (
                <div key={index} className="result-item">
                  <div className="result-info">
                    <div className="result-header">
                      <div className="result-actions">
                        <button onClick={() => copyToClipboard(item.shortUrl)} className="copy-icon rounded-btn">
                          <Copy size={16} />
                        </button>
                        <button onClick={() => window.open(item.shortUrl, '_blank')} className="external-icon rounded-btn">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="short-link">
                      <a href={item.shortUrl} target="_blank" rel="noopener noreferrer">
                        {item.shortUrl}
                      </a>
                    </div>
                    
                    <div className="original-url">
                      <span className="original-label">Original:</span>
                      {item.originalUrl}
                    </div>
                    
                    <div className="result-meta">
                      <span className="clicks-badge">
                        <MousePointer size={14} />
                        {item.clicks} clicks
                      </span>
                      <span className="expires-badge">
                        <Clock size={14} />
                        Expires: {item.expiresAt.toLocaleDateString()}, {item.expiresAt.toLocaleTimeString()}
                      </span>
                      <span className="created-badge">
                        <Calendar size={14} />
                        Created: {item.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="notification-close">×</button>
        </div>
      )}
    </div>
  )
}

const AnalyticsPage = ({ urlData, setActiveTab }) => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('clicks')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalytics = async (range = timeRange) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://shorten-url-api-40d6.onrender.com/api/analytics?timeRange=${range}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch analytics')
      }
      
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        throw new Error('Analytics data fetch failed')
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(timeRange)
  }, [timeRange])

  const stats = analyticsData ? analyticsData.stats : {
    totalUrls: urlData.length,
    totalClicks: urlData.reduce((sum, url) => sum + url.clicks, 0),
    activeUrls: urlData.filter(url => url.isValid && new Date() < new Date(url.expiresAt)).length,
    expiredUrls: urlData.filter(url => !url.isValid || new Date() >= new Date(url.expiresAt)).length,
    avgClicksPerUrl: urlData.length > 0 ? Math.round(urlData.reduce((sum, url) => sum + url.clicks, 0) / urlData.length) : 0
  }

  const topUrls = analyticsData ? analyticsData.topUrls : urlData.slice(0, 10)

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value)
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="section-header">
          <h2 className="section-title" style={{color: 'black'}}>
            Analytics Dashboard
          </h2>
          <p className="section-subtitle" style={{color: 'black'}}>
            Track performance, monitor engagement, and optimize your link strategy.
          </p>
        </div>

        <div className="analytics-controls">
          <div className="time-range-selector">
            <label style={{color: 'black'}}>Time Range</label>
            <select value={timeRange} onChange={handleTimeRangeChange} disabled={loading}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="metric-selector">
            <label style={{color: 'black'}}>Primary Metric</label>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              <option value="clicks">Total Clicks</option>
              <option value="unique">Unique Visitors</option>
              <option value="conversion">Conversion Rate</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>Failed to load analytics: {error}</span>
            <button onClick={() => fetchAnalytics(timeRange)} className="retry-btn">Retry</button>
          </div>
        )}

        <div className={`stats-grid ${loading ? 'loading' : ''}`}>
          <div className="stat-card primary">
            <div className="stat-icon">
              <Link2 size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '...' : stats.totalUrls}</div>
              <div className="stat-label">Total URLs</div>
              <div className="stat-change positive">+12% this week</div>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <MousePointer size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '...' : stats.totalClicks.toLocaleString()}</div>
              <div className="stat-label">Total Clicks</div>
              <div className="stat-change positive">+28% this week</div>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <Activity size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '...' : stats.activeUrls}</div>
              <div className="stat-label">Active URLs</div>
              <div className="stat-change neutral">No change</div>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <Clock size={32} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{loading ? '...' : stats.expiredUrls}</div>
              <div className="stat-label">Expired URLs</div>
              <div className="stat-change negative">+5% this week</div>
            </div>
          </div>
        </div>

        {(topUrls && topUrls.length > 0) ? (
          <div className="analytics-content">
            <div className="urls-table">
              <div className="table-header">
                <h3 style={{color: 'black'}}>URL Performance</h3>
                <div className="table-actions">
                  <button className="action-btn secondary">
                    <Download size={16} />
                    Export
                  </button>
                  <button className="action-btn secondary">
                    <Filter size={16} />
                    Filter
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="urls-data-table">
                  <thead>
                    <tr>
                      <th>Short URL</th>
                      <th>Original URL</th>
                      <th>Clicks</th>
                      <th>Created</th>
                      <th>Expires</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUrls.map((url, index) => (
                      <tr key={url.shortCode || index}>
                        <td>
                          <div className="short-url-cell">
                            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                              {url.shortUrl}
                            </a>
                            <button 
                              className="copy-btn rounded-btn"
                              onClick={() => navigator.clipboard.writeText(url.shortUrl)}
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="original-url-cell">
                            {url.originalUrl.length > 50 
                              ? `${url.originalUrl.substring(0, 50)}...` 
                              : url.originalUrl}
                          </div>
                        </td>
                        <td>
                          <div className="clicks-cell">
                            <span className="clicks-count">{url.clicks}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            {new Date(url.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            {new Date(url.expiresAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className={`status-badge ${url.isValid ? 'active' : 'expired'}`}>
                            {url.isValid ? 'Active' : 'Expired'}
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn small rounded-btn">
                              <Eye size={14} />
                            </button>
                            <button className="action-btn small rounded-btn">
                              <Settings size={14} />
                            </button>
                            <button className="action-btn small danger rounded-btn">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <BarChart3 size={64} />
            </div>
            <h3 style={{color: 'black'}}>No Data Yet</h3>
            <p style={{color: 'black'}}>Create some short URLs to see analytics and performance metrics here.</p>
            <button
              className="cta-button rounded-btn"
              onClick={() => setActiveTab('shortener')}
            >
              <Zap size={20} />
              Create Your First URL
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const NoAnimationBulkApp = () => {
  const [activeTab, setActiveTab] = useState('shortener')
  const [urlData, setUrlData] = useState([])

  const handleUrlShortened = (newUrl) => {
    setUrlData(prev => [newUrl, ...prev])
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'shortener' && (
          <URLShortenerPage onUrlShortened={handleUrlShortened} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsPage 
            urlData={urlData}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  )
}

export default NoAnimationBulkApp
