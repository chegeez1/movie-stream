class Cache {
  constructor() {
    this.cache = new Map()
  }

  set(key, value, duration) {
    const expiresAt = Date.now() + duration
    this.cache.set(key, { value, expiresAt })
    
    // Cleanup expired entries
    this.cleanup()
  }

  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  delete(key) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  size() {
    return this.cache.size
  }
}

export const cache = new Cache()

// Auto cleanup every 5 minutes
setInterval(() => {
  cache.cleanup()
}, 5 * 60 * 1000)
