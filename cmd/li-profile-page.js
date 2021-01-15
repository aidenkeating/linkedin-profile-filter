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
export async function scrapeProfilePage() {
  const messenger = new ChromeMessenger();
  console.log("scrapping personal profile page..")

  const scrape = new ProfilePageScrape(document);
  console.log(scrape)
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

setInterval(scrapeProfilePage.bind(null), 2500);
scrapeProfilePage();
