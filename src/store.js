/* global chrome */

/**
 * Basic wrapper around chrome.storage.
 */
export default class ChromeStore {
  /**
   * @param {Object} store A custom store implementation following the same API
   * as chrome.storage.
   */
  constructor(store) {
    this.store = store || chrome.storage.sync;
  }

  /**
   * @param {string|string[]} key
   */
  async get(key) {
    return new Promise(resolve => this.store.get(key, resolve));
  }

  /**
   * @param {Object} val
   */
  async set(val) {
    return new Promise(resolve => this.store.set(val, resolve));
  }
}
