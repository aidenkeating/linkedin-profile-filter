/* global chrome */
import { ProfilePageScrape, genScrapeId, genMatchDiv } from '../src/page-scraper';
import ChromeMessenger from '../src/messenger';

function handleMessageResponse(msg, scrape) {
  // The profile does not need to be filtered.
  if (!msg || document.getElementById('linkedin-profile-filter-status')) {
    return;
  }
  const topCardElem = document.querySelector('.is-header-zone');
  if (!topCardElem) {
    return;
  }
  topCardElem.insertBefore(genMatchDiv(msg, scrape), topCardElem.firstChild);
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
  const scrape = new ProfilePageScrape(document);
  if (!scrape.name || !scrape.location
    || !scrape.company || !!document.getElementById(genScrapeId(scrape))) {
    return;
  }

  try {
    const results = await messenger.search({
      name: scrape.name,
      location: scrape.location,
      company: scrape.company
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
    handleMessageResponse(primaryResult, scrape);
  } catch (err) {
    console.error('Failed to check profile', err);
  }
}

setInterval(scrapePage.bind(null, messenger), 2500);
scrapePage(messenger);
