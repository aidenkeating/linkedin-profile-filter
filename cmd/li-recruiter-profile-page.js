import { RecruiterProfilePageScrape, genScrapeId, genMatchDiv } from '../src/page-scraper';
import ChromeMessenger from '../src/messenger';

function handleMessageResponse(msg, scrape) {
  if (!msg || document.getElementById('linkedin-profile-filter-status')) {
    return;
  }
  if (!msg.matches) {
    console.error('No matches were retrieved', msg);
  }
  const backgroundCardElem = document.querySelector('#profile-ugc .module-header');
  if (!backgroundCardElem) {
    return;
  }
  const primaryMatch = msg.matches.find(m => m.locationMatch);
  if (!primaryMatch) {
    return;
  }
  backgroundCardElem.insertBefore(genMatchDiv(primaryMatch, scrape), backgroundCardElem.children[1]);
}

// Initialize
const messenger = new ChromeMessenger();
async function scrapePage(messenger) {
  const scrape = new RecruiterProfilePageScrape(document);
  if (!scrape.name || !scrape.location || !scrape.company || !!document.getElementById(genScrapeId(scrape))) {
    return;
  }

  try {
    const results = await messenger.search({
      name: scrape.name,
      location: scrape.location,
      company: scrape.company
    });
    handleMessageResponse(results, scrape);
  } catch (err) {
    console.error('Failed to check profile', err);
  }
}

scrapePage(messenger).then(() => setInterval(scrapePage.bind(null, messenger), 2500));

