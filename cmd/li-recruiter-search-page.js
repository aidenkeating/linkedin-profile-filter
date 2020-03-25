import { RecruiterSearchPageScrape, genScrapeId, genMatchDiv } from "../src/page-scraper";
import ChromeMessenger from "../src/messenger";

const messenger = new ChromeMessenger();

async function scrapePage(messenger) {
  console.log('scraping page')
  const resultListElem = document.getElementById('search-results');
  if (!resultListElem) {
    return;
  }
  const resultElems = resultListElem.querySelectorAll('.search-result');
  if (!resultElems || resultElems.length === 0) {
    return;
  }
  Array.from(resultElems).filter(re => !re.querySelector('.linkedin-profile-filter'))
  .map(elem => [elem, new RecruiterSearchPageScrape(elem) ])
  .filter(([_, scrape]) => !!scrape.name && !!scrape.location && !!scrape.company && !document.getElementById(genScrapeId(scrape)))
  .forEach(async ([elem, scrape]) => {
    try {
      const results = await messenger.search({
        name: scrape.name,
        location: scrape.location,
        company: scrape.company
      });
      if (!results || !results.matches) {
        return;
      }
      const primaryResult = results.matches.find(r => r.locationMatch);
      if (!primaryResult) {
        elem.insertBefore(genNotFoundDiv(scrape), elem.firstChild);
        return;
      }
      if (!!document.getElementById(genScrapeId(scrape))) {
        return;
      }
      elem.insertBefore(genMatchDiv(primaryResult, scrape, results.matches.filter(r => !r.locationMatch)), elem.firstChild);
      const actionsElem = elem.querySelector('.result-actions');
      actionsElem.style['margin-top'] = '50px';
    } catch(err) {
      console.error('Failed to search profile', scrape, err);
    }
  });
}
scrapePage(messenger).then(() => setInterval(scrapePage.bind(null, messenger), 2500));
