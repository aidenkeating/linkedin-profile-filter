import { RecruiterSearchPageScrape, genScrapeId, genMatchDiv } from "../src/page-scraper";

const scrapeType = "recruiterSearch"

export async function scrapeRecruiterSearchPage(messenger) {
  console.log('scraping recrutier search page')
  const resultListElem = document.getElementById('results-container');
  if (!resultListElem) {
    return;
  }

  const resultElems = resultListElem.querySelectorAll('.profile-list__border-bottom');
  if (!resultElems || resultElems.length === 0) {
    return;
  }
  Array.from(resultElems).filter(re => !re.querySelector('.linkedin-profile-filter'))
  .map(elem => [elem, new RecruiterSearchPageScrape(elem) ])
  .filter(([_, scrape]) => !!scrape.name && !!scrape.location && !!scrape.company && !document.getElementById(genScrapeId(scrape, scrapeType)))
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
        // elem.insertBefore(genNotFoundDiv(scrape), elem.firstChild);
        return;
      }
      if (!!document.getElementById(genScrapeId(scrape, scrapeType))) {
        return;
      }
      elem.insertBefore(genMatchDiv(primaryResult, scrape, scrapeType), elem.firstChild);
      // const actionsElem = elem.querySelector('.result-actions');
      // actionsElem.style['margin-top'] = '50px';
    } catch(err) {
      console.error('Failed to search profile', scrape, err);
    }
  });
}
