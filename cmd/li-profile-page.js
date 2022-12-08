/* global chrome */
import { ProfilePageScrape, genScrapeId, genMatchDiv } from '../src/page-scraper';

function handleMessageResponse(msg, scrape) {
  // The profile does not need to be filtered.
  if (!msg || document.getElementById('linkedin-profile-filter-status')) {
    return;
  }
  const topCardElem = document.querySelector('.topcard-condensed__content');
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
export async function scrapeProfilePage(messenger) {
  console.log("scrapping personal profile page..")

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
