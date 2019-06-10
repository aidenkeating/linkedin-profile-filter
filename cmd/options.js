import ChromeStore from '../src/store';
import ChromeMessenger from '../src/messenger';

const SHEET_ID_ID = 'sheet-id';
const COMPANY_NAME_ID = 'company-name-range';
const COMPANY_LOCATION_ID = 'company-location-range';
const COMPANY_TIER_ID = 'company-tier-range';
const CACHE_TIMEOUT_ID = 'cache-timeout';
const SAVE_STATUS_ID = 'save-status';
const SAVE_ID = 'save';
const CLEAR_CACHE_ID = 'clear-cache';

const store = new ChromeStore();
const messenger = new ChromeMessenger();

async function clearCache(e) {
  e.preventDefault();

  await messenger.clearCache();
  const statusElem = document.getElementById(SAVE_STATUS_ID);
  statusElem.textContent = 'Cache cleared.';
  setTimeout(() => { statusElem.textContent = ''; }, 1500);
}

async function saveOptions(e) {
  e.preventDefault();
  await store.set({
    sheetId: document.getElementById(SHEET_ID_ID).value,
    nameRange: document.getElementById(COMPANY_NAME_ID).value,
    locationRange: document.getElementById(COMPANY_LOCATION_ID).value,
    tierRange: document.getElementById(COMPANY_TIER_ID).value,
    cacheTimeout: document.getElementById(CACHE_TIMEOUT_ID).value,
  });
  const statusElem = document.getElementById(SAVE_STATUS_ID);
  statusElem.textContent = 'Options saved.';
  setTimeout(() => { statusElem.textContent = ''; }, 1500);
}

async function restoreOptions() {
  const opts = await store.get(['sheetId', 'nameRange', 'locationRange', 'tierRange', 'cacheTimeout']);

  document.getElementById(SHEET_ID_ID).value = opts.sheetId;
  document.getElementById(COMPANY_NAME_ID).value = opts.nameRange;
  document.getElementById(COMPANY_LOCATION_ID).value = opts.locationRange;
  document.getElementById(COMPANY_TIER_ID).value = opts.tierRange;
  document.getElementById(CACHE_TIMEOUT_ID).value = opts.cacheTimeout;
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById(SAVE_ID).addEventListener('click', saveOptions);
document.getElementById(CLEAR_CACHE_ID).addEventListener('click', clearCache);
