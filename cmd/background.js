/* global chrome */

import { countryIsoMap, isoCountryMap } from '../src/countries';
import { GoogleSheets } from '../src/sheets-client';
import { FilterCriteriaReadOptions, FilterCriteriaClient } from '../src/profile-filter';
import * as config from '../config.json';

/**
 * Retrieve a Google Sheets bearer token.
 * @returns {Promise<string>} Google Sheets bearer token.
 */
function getToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (!token) {
        reject(new Error('Failed to retrieve new token'));
        return;
      }
      resolve(token);
    });
  });
}

/**
 * Promise wrapper for getting extension options.
 */
function getOptions() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['sheetId', 'nameRange', 'locationRange', 'tierRange', 'lastRead', 'cacheTimeout'], opts => resolve(opts));
  });
}

/**
 * Promise wrapper for setting extension options.
 * @param {Object} opts The options to set.
 */
function setOptions(opts) {
  return new Promise(resolve => chrome.storage.sync.set(opts, resolve));
}

/**
 * @returns {FilterCriteria[]}
 */
function getLocalCache() {
  return new Promise(resolve => chrome.storage.local.get(['filterCriteria'], resolve));
}

function setLocalCache(opts) {
  return new Promise(resolve => chrome.storage.local.set(opts, resolve));
}

/**
 * Get the filter criteria, trying from an in-memory cache first.
 * @param {Object} opts
 * @returns {FilterCriteria[]}
 */
async function getCriteria(opts) {
  const now = Date.now();
  const fiveMinutes = 60 * 1000 * (opts.cacheTimeout || 5);

  const localCache = await getLocalCache();
  const cachedCriteria = localCache.filterCriteria;
  if (cachedCriteria && opts.lastRead && now - opts.lastRead <= fiveMinutes) {
    console.info('Using filter criteria cache');
    return cachedCriteria;
  }
  console.info('Performing Google Sheets read');
  const filterReadOptions = [
    new FilterCriteriaReadOptions(opts.sheetId, opts.nameRange, opts.locationRange, opts.tierRange),
  ];

  const sheets = new GoogleSheets(getToken);
  const criteriaClient = new FilterCriteriaClient(sheets, filterReadOptions);
  const filterCriteria = await criteriaClient.getFilterCriteria();
  await setOptions({ lastRead: Date.now() });
  await setLocalCache({ filterCriteria });
  return filterCriteria;
}

async function handleSearch(body) {
  const isoLocation = isoCountryMap[body.location.toUpperCase()]
    ? body.location
    : countryIsoMap[body.location.toLowerCase()];
  if (!isoLocation) {
    return null;
  }

  const options = await getOptions();
  const criteria = await getCriteria(options);
  const matches = criteria.filter(c => c.name.toLowerCase() === body.company.toLowerCase()
  || c.altNames.includes(body.company.toLowerCase()))
    .map((c) => {
      const criteriaIsoLocation = isoCountryMap[c.location.toUpperCase()]
        ? c.location
        : countryIsoMap[c.location.toLowerCase()];
      return {
        name: c.name,
        fullLocation: isoCountryMap[criteriaIsoLocation],
        isoLocation: criteriaIsoLocation,
        locationMatch: c.location.toLowerCase() === isoLocation.toLowerCase(),
        tier: c.tier,
      };
    });
  return { matches };
}

async function handleClearCache() {
  await setLocalCache({ filterCriteria: null });
}

async function handleRestoreDefaults() {
  await setOptions(config);
  return { options: config };
}

chrome.runtime.onInstalled.addListener(async () => {
  const token = await getToken();
  console.info('Retrieved token', token);
  await setOptions(config);
  console.info('Setup complete');
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (!request.action) {
    sendResponse({ error: new Error('No action was provided') });
    return true;
  }
  if (request.action === 'search') {
    handleSearch(request.body).then((result) => {
      if (!result) {
        sendResponse({ error: new Error('Results are undefined') });
        return;
      }
      sendResponse(result);
    });
  }
  if (request.action === 'clear-cache') {
    handleClearCache().then(sendResponse);
  }
  if (request.action === 'restore-defaults') {
    handleRestoreDefaults().then(sendResponse);
  }
  return true;
});
