/* global chrome */

export default class ChromeMessenger {
  constructor(producer, opts = {}) {
    this.producer = producer || chrome.runtime;
    this.searchKey = opts.searchKey || 'search';
    this.clearCacheKey = opts.clearCacheKey || 'clear-cache';
  }

  /**
   * @param {Object} opts
   * @param {string} opts.name Name on the LinkedIn profile.
   * @param {string} opts.location Location of the LinkedIn profile.
   * @param {string} opts.company Company name of the LinkedIn profile.
   */
  async search(opts) {
    return new Promise((resolve, reject) => this.producer.sendMessage({
      action: this.searchKey,
      body: opts,
    }, (resp) => {
      if (!resp || resp.error) {
        reject(resp.error || new Error('Received an empty response'));
        return;
      }
      resolve(resp);
    }));
  }

  async clearCache() {
    return new Promise(resolve => this.producer.sendMessage({
      action: this.clearCacheKey,
    }, resolve));
  }
}
