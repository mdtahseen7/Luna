/**
 * Proxy Manager - Handles multiple proxy URLs with rotation
 */

class ProxyManager {
    constructor() {
        // Parse multiple proxy URLs from environment variable
        const proxyString = process.env.NEXT_PUBLIC_PROXY_URI || '';
        this.proxies = proxyString
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        
        this.currentIndex = 0;
        this.failedProxies = new Set();
    }

    /**
     * Get a random proxy URL
     */
    getRandomProxy() {
        if (this.proxies.length === 0) return null;
        
        const availableProxies = this.proxies.filter(
            (_, index) => !this.failedProxies.has(index)
        );
        
        if (availableProxies.length === 0) {
            // Reset failed proxies if all have failed
            this.failedProxies.clear();
            return this.proxies[0];
        }
        
        const randomIndex = Math.floor(Math.random() * availableProxies.length);
        return availableProxies[randomIndex];
    }

    /**
     * Get next proxy in rotation (round-robin)
     */
    getNextProxy() {
        if (this.proxies.length === 0) return null;
        
        // Try to find next available proxy
        let attempts = 0;
        while (attempts < this.proxies.length) {
            const proxy = this.proxies[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
            
            if (!this.failedProxies.has(this.currentIndex)) {
                return proxy;
            }
            attempts++;
        }
        
        // If all proxies failed, reset and return first
        this.failedProxies.clear();
        return this.proxies[0];
    }

    /**
     * Mark a proxy as failed
     */
    markProxyFailed(proxyUrl) {
        const index = this.proxies.indexOf(proxyUrl);
        if (index !== -1) {
            this.failedProxies.add(index);
            
            // Auto-recover failed proxies after 5 minutes
            setTimeout(() => {
                this.failedProxies.delete(index);
            }, 5 * 60 * 1000);
        }
    }

    /**
     * Get all proxy URLs
     */
    getAllProxies() {
        return [...this.proxies];
    }

    /**
     * Check if proxies are configured
     */
    hasProxies() {
        return this.proxies.length > 0;
    }

    /**
     * Get proxy with URL (adds URL to proxy)
     */
    getProxiedUrl(url, strategy = 'random') {
        const proxy = strategy === 'random' 
            ? this.getRandomProxy() 
            : this.getNextProxy();
        
        if (!proxy) return url;
        
        return `${proxy}${encodeURIComponent(url)}`;
    }
}

// Create singleton instance
const proxyManager = new ProxyManager();

export default proxyManager;
