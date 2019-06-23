/* global chrome */
import { ProfilePageScrape } from '../src/page-scraper';
import ChromeMessenger from '../src/messenger';

function buildTopCardNotification(c) {
  return `<div id="linkedin-profile-filter-status" class="inline-flex ml2" style="color: red; font-weight: bold; border: 3px solid red; padding: 5px; width: 100%; margin-bottom: 10px;">
      <span class="pv-member-badge--for-top-card-v3 inline-flex pv-member-badge ember-view">${c.name} is a partner (${c.tier}) in ${c.fullLocation || c.isoLocation}
    </div>`;
}

function handleMessageResponse(msg) {
  // The profile does not need to be filtered.
  if (!msg || document.getElementById('linkedin-profile-filter-status')) {
    return;
  }
  const topCardElem = document.querySelector('.is-header-zone');
  if (!topCardElem) {
    return;
  }
  topCardElem.outerHTML = `${topCardElem.outerHTML}${buildTopCardNotification(msg)}`;
}

function handleRemoveNotification() {
  const notifElem = document.getElementById('linkedin-profile-filter-status');
  if (!notifElem) {
    return;
  }
  notifElem.remove();
}

// Initialize
const messenger = new ChromeMessenger();
async function scrapePage(messenger) {
  const profileScraper = new ProfilePageScrape(document);
  if (!profileScraper.name || !profileScraper.location
    || !profileScraper.company) {
    return;
  }

  try {
    const results = await messenger.search({
      name: profileScraper.name,
      location: profileScraper.location,
      company: profileScraper.company
    });
    if (!results || !results.matches) {
      handleRemoveNotification();
      return;
    }
    const primaryResult = results.matches.find(r => !!r.locationMatch);
    if (!primaryResult) {
      handleRemoveNotification();
      return;
    }
    handleMessageResponse(primaryResult);
  } catch (err) {
    console.error('Failed to check profile', err);
  }
}

setInterval(scrapePage.bind(null, messenger), 100);
scrapePage(messenger);
