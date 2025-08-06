import { nanoid } from 'nanoid';
import { Logger } from '../middleware/logger.js';

export class URLStore {
  constructor() {
    this.urls = new Map();
    this.analytics = new Map();
  }

  createShortURL(originalUrl, validity = 30, customShortcode = null, customName = null) {
    Logger.info('Creating short URL', { originalUrl, validity, customShortcode, customName });

    try {
      new URL(originalUrl);
    } catch (error) {
      Logger.error('Invalid URL format', { originalUrl, error: error.message });
      throw new Error('Invalid URL format');
    }

    let shortcode;
    if (customShortcode) {
      if (!/^[a-zA-Z0-9]{1,20}$/.test(customShortcode)) {
        Logger.error('Invalid custom shortcode format', { customShortcode });
        throw new Error('Invalid shortcode format. Must be alphanumeric and up to 20 characters');
      }
      
      if (this.urls.has(customShortcode)) {
        Logger.error('Shortcode collision detected', { customShortcode });
        throw new Error('Shortcode already exists');
      }
      
      shortcode = customShortcode;
    } else {
      do {
        shortcode = nanoid(6);
      } while (this.urls.has(shortcode));
    }

    const createdAt = new Date();
    const expiryDate = new Date(createdAt.getTime() + (validity * 60 * 1000));

    const urlData = {
      originalUrl,
      shortcode,
      customName: customName || 'Untitled Link',
      createdAt: createdAt.toISOString(),
      expiryDate: expiryDate.toISOString(),
      expiresAt: expiryDate.toISOString(), // Alias for compatibility
      validity,
      isValid: true,
      clicks: 0
    };

    this.urls.set(shortcode, urlData);

    this.analytics.set(shortcode, {
      shortcode,
      totalClicks: 0,
      clicks: []
    });

    Logger.info('Short URL created successfully', { shortcode, originalUrl, customName, expiryDate: urlData.expiryDate });

    return {
      shortcode,
      shortLink: `http://localhost:3000/${shortcode}`,
      expiry: urlData.expiryDate,
      customName: urlData.customName,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt
    };
  }

  getOriginalURL(shortcode) {
    const urlData = this.urls.get(shortcode);
    
    if (!urlData) {
      Logger.warn('Shortcode not found', { shortcode });
      return null;
    }

    const now = new Date();
    const expiryDate = new Date(urlData.expiryDate);
    
    if (now > expiryDate) {
      Logger.warn('Shortcode expired', { shortcode, expiryDate: urlData.expiryDate });
      return null;
    }

    return urlData;
  }

  recordClick(shortcode, referrer = '', userAgent = '', ip = '') {
    const analytics = this.analytics.get(shortcode);
    const urlData = this.urls.get(shortcode);
    
    if (analytics && urlData) {
      analytics.totalClicks++;
      urlData.clicks = analytics.totalClicks; // Keep URL data in sync
      
      analytics.clicks.push({
        timestamp: new Date().toISOString(),
        referrer: referrer || 'direct',
        userAgent,
        ip,
        geolocation: this.getCoarseGeolocation(ip) // Simplified geolocation
      });

      Logger.info('Click recorded', { shortcode, totalClicks: analytics.totalClicks, referrer, ip });
    }
  }

  getAnalytics(shortcode) {
    const urlData = this.urls.get(shortcode);
    const analytics = this.analytics.get(shortcode);

    if (!urlData || !analytics) {
      Logger.warn('Analytics not found for shortcode', { shortcode });
      return null;
    }

    return {
      shortcode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiryDate: urlData.expiryDate,
      totalClicks: analytics.totalClicks,
      clicks: analytics.clicks
    };
  }

  getAllURLs() {
    const allUrls = [];
    
    for (const [shortcode, urlData] of this.urls.entries()) {
      const analytics = this.analytics.get(shortcode);
      allUrls.push({
        shortcode,
        originalUrl: urlData.originalUrl,
        customName: urlData.customName || 'Untitled Link',
        shortLink: `http://localhost:3000/${shortcode}`,
        createdAt: urlData.createdAt,
        expiryDate: urlData.expiryDate,
        expiresAt: urlData.expiresAt || urlData.expiryDate,
        isValid: urlData.isValid !== false && new Date() < new Date(urlData.expiryDate),
        clicks: urlData.clicks || (analytics ? analytics.totalClicks : 0),
        totalClicks: analytics ? analytics.totalClicks : 0
      });
    }

    return allUrls;
  }

  getAll() {
    return this.getAllURLs();
  }

  getCoarseGeolocation(ip) {
    if (ip.startsWith('192.168.') || ip.startsWith('127.0.') || ip === '::1') {
      return 'Local Network';
    }
    return 'Unknown Location';
  }
}
