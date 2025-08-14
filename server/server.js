import express from 'express';
import cors from 'cors';
import process from 'process';
import { URLStore } from './models/urlStore.js';
import { Logger, requestLogger } from './middleware/logger.js';

const app = express();
const PORT = 3000;
const urlStore = new URLStore();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const errorHandler = (error, req, res, next) => {
  Logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url
  });

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
};

const validateCreateURLInput = (req, res, next) => {
  const { url, validity } = req.body;

  if (!url) {
    Logger.warn('Missing required field: url', { body: req.body });
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required field: url'
    });
  }

  if (validity !== undefined) {
    const validityNum = parseInt(validity);
    if (isNaN(validityNum) || validityNum <= 0) {
      Logger.warn('Invalid validity period', { validity });
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Validity must be a positive integer representing minutes'
      });
    }
    req.body.validity = validityNum;
  }

  next();
};

app.post('/shorturls', validateCreateURLInput, (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    Logger.info('Creating short URL request', { url, validity, shortcode });

    const result = urlStore.createShortURL(url, validity, shortcode);

    Logger.info('Short URL created successfully', result);

    res.status(201).json(result);
  } catch (error) {
    Logger.error('Error creating short URL', { error: error.message, body: req.body });

    if (error.message.includes('Invalid URL format')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid URL format'
      });
    }

    if (error.message.includes('shortcode already exists') || error.message.includes('Shortcode collision')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Shortcode already exists'
      });
    }

    if (error.message.includes('Invalid shortcode format')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid shortcode format. Must be alphanumeric and up to 20 characters'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create short URL'
    });
  }
});

// Add API endpoints that frontend expects
app.post('/api/urls', validateCreateURLInput, (req, res) => {
  try {
    const { originalUrl, validityPeriod = 30, customCode } = req.body;

    Logger.info('Creating short URL via API', { originalUrl, validityPeriod, customCode });

    const result = urlStore.createShortURL(originalUrl, validityPeriod, customCode);

    Logger.info('Short URL created successfully via API', result);

    // Format response to match frontend expectations
    res.status(201).json({
      shortUrl: result.shortUrl,
      originalUrl: result.originalUrl,
      shortcode: result.shortcode,
      createdAt: result.createdAt,
      expiresAt: result.expiresAt
    });
  } catch (error) {
    Logger.error('Error creating short URL via API', { error: error.message, body: req.body });

    if (error.message.includes('Invalid URL format')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid URL format'
      });
    }

    if (error.message.includes('shortcode already exists') || error.message.includes('Shortcode collision')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Shortcode already exists'
      });
    }

    if (error.message.includes('Invalid shortcode format')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid shortcode format. Must be alphanumeric and up to 20 characters'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create short URL'
    });
  }
});

app.post('/api/urls/bulk', (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URLs array is required'
      });
    }

    Logger.info('Creating bulk short URLs via API', { count: urls.length });

    const results = [];
    const errors = [];

    urls.forEach((urlData, index) => {
      try {
        const { url, validity = 30, customCode } = urlData;
        const result = urlStore.createShortURL(url, validity, customCode);
        results.push({
          ...result,
          originalUrl: result.originalUrl,
          shortUrl: result.shortUrl
        });
      } catch (error) {
        errors.push({
          index,
          url: urlData.url,
          error: error.message
        });
      }
    });

    Logger.info('Bulk short URLs created', { 
      successful: results.length, 
      errors: errors.length 
    });

    res.status(201).json({
      success: true,
      results: results.map(result => ({
        success: true,
        originalUrl: result.originalUrl,
        shortLink: result.shortUrl,
        shortcode: result.shortcode,
        createdAt: result.createdAt,
        expiry: result.expiresAt,
        validity: result.validity
      })).concat(errors.map(error => ({
        success: false,
        originalUrl: error.url,
        error: error.error
      }))),
      successful: results.length,
      failed: errors.length,
      total: urls.length
    });
  } catch (error) {
    Logger.error('Error creating bulk short URLs', { error: error.message, body: req.body });

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create bulk short URLs'
    });
  }
});

// DELETE route to delete a URL
app.delete('/api/urls/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  
  Logger.info('DELETE request received', { shortcode });

  try {
    const deleted = urlStore.deleteURL(shortcode);
    
    if (!deleted) {
      Logger.warn('Shortcode not found for deletion', { shortcode });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Shortcode not found'
      });
    }

    Logger.info('URL deleted successfully', { shortcode });
    res.json({
      success: true,
      message: 'URL deleted successfully'
    });

  } catch (error) {
    Logger.error('Error deleting URL', { error: error.message, shortcode });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete URL'
    });
  }
});

app.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;

  Logger.info('Redirect request', { shortcode });

  const urlData = urlStore.getOriginalURL(shortcode);

  if (!urlData) {
    Logger.warn('Shortcode not found or expired', { shortcode });
    return res.status(404).json({
      error: 'Not Found',
      message: 'Short URL not found or has expired'
    });
  }

  const referrer = req.get('Referer') || '';
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || '';

  urlStore.recordClick(shortcode, referrer, userAgent, ip);

  Logger.info('Redirecting to original URL', { 
    shortcode, 
    originalUrl: urlData.originalUrl,
    referrer,
    ip
  });

  res.redirect(urlData.originalUrl);
});

app.get('/shorturls/:shortcode', (req, res) => {
  const { shortcode } = req.params;

  Logger.info('Statistics request', { shortcode });

  const analytics = urlStore.getAnalytics(shortcode);

  if (!analytics) {
    Logger.warn('Statistics not found for shortcode', { shortcode });
    return res.status(404).json({
      error: 'Not Found',
      message: 'Short URL not found'
    });
  }

  Logger.info('Statistics retrieved', { shortcode, totalClicks: analytics.totalClicks });

  res.json(analytics);
});

app.get('/api/statistics', (req, res) => {
  Logger.info('All statistics request');

  const allUrls = urlStore.getAllURLs();

  Logger.info('All statistics retrieved', { count: allUrls.length });

  res.json({
    urls: allUrls,
    totalUrls: allUrls.length,
    totalClicks: allUrls.reduce((sum, url) => sum + url.totalClicks, 0)
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Validation for bulk URL creation
const validateBulkURLInput = (req, res, next) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    Logger.warn('Missing or invalid urls array', { body: req.body });
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing or invalid urls array'
    });
  }

  if (urls.length > 5) {
    Logger.warn('Too many URLs in bulk request', { count: urls.length });
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Maximum 5 URLs allowed per bulk request'
    });
  }

  for (let i = 0; i < urls.length; i++) {
    const { url, validity } = urls[i];
    
    if (!url) {
      Logger.warn(`Missing URL in bulk request at index ${i}`, { urls });
      return res.status(400).json({
        error: 'Bad Request',
        message: `Missing URL at index ${i}`
      });
    }

    if (validity !== undefined) {
      const validityNum = parseInt(validity);
      if (isNaN(validityNum) || validityNum <= 0) {
        Logger.warn(`Invalid validity at index ${i}`, { validity });
        return res.status(400).json({
          error: 'Bad Request',
          message: `Invalid validity at index ${i}. Must be a positive integer representing minutes`
        });
      }
    }
  }

  next();
};

// Enhanced analytics endpoint
app.get('/api/analytics', (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    const allUrls = urlStore.getAll();
    
    // Calculate time range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Filter URLs by time range
    const filteredUrls = allUrls.filter(url => 
      new Date(url.createdAt) >= startDate
    );
    
    // Calculate statistics
    const stats = {
      totalUrls: filteredUrls.length,
      totalClicks: filteredUrls.reduce((sum, url) => sum + (url.clicks || 0), 0),
      activeUrls: filteredUrls.filter(url => 
        url.isValid && new Date() < new Date(url.expiresAt)
      ).length,
      expiredUrls: filteredUrls.filter(url => 
        !url.isValid || new Date() >= new Date(url.expiresAt)
      ).length,
      avgClicksPerUrl: filteredUrls.length > 0 
        ? Math.round(filteredUrls.reduce((sum, url) => sum + (url.clicks || 0), 0) / filteredUrls.length)
        : 0
    };
    
    // Top performing URLs
    const topUrls = filteredUrls
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(url => ({
        shortCode: url.shortcode,
        shortUrl: `http://localhost:${PORT}/${url.shortcode}`,
        originalUrl: url.originalUrl,
        customName: url.customName || 'Untitled Link',
        clicks: url.clicks || 0,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        isValid: url.isValid && new Date() < new Date(url.expiresAt)
      }));
    
    // Click trends (daily)
    const clickTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayClicks = filteredUrls.reduce((sum, url) => {
        // For demo purposes, generate some click history
        const dayClicks = Math.floor(Math.random() * (url.clicks || 0));
        return sum + dayClicks;
      }, 0);
      
      clickTrends.push({
        date: dayStart.toISOString().split('T')[0],
        clicks: dayClicks
      });
    }
    
    res.json({
      success: true,
      data: {
        stats,
        topUrls,
        clickTrends,
        timeRange,
        totalUrls: allUrls.length
      }
    });
    
  } catch (error) {
    Logger.error('Analytics fetch failed', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch analytics'
    });
  }
});

app.use(errorHandler);

app.use('*', (req, res) => {
  Logger.warn('Route not found', { method: req.method, url: req.url });
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  Logger.info('URL Shortener Microservice started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`\n🚀 URL Shortener Microservice running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Statistics API: http://localhost:${PORT}/api/statistics`);
});

process.on('SIGTERM', () => {
  Logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  Logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});
