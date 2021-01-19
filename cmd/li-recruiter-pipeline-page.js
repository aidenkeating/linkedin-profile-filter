import { RecruiterSearchOrPipelinePageScrape, genScrapeId, genMatchDiv } from "../src/page-scraper";

const scrapeType = "recruiterPipeline"

export async function scrapeRecruiterPipelinePage(messenger) {
  console.log('scraping recrutier pipeline page')
  const resultListElem = document.querySelector(".manage-core__main-content-wrapper");
  if (!resultListElem) {
    return;
  }

  const resultElems = resultListElem.querySelectorAll('.profile-list__border-bottom');
  if (!resultElems || resultElems.length === 0) {
    return;
  }
  Array.from(resultElems).filter(re => !re.querySelector('.linkedin-profile-filter'))
  .map(elem => [elem, new RecruiterSearchOrPipelinePageScrape(elem) ])
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
        return;
      }
      if (!!document.getElementById(genScrapeId(scrape, scrapeType))) {
        return;
      }
      elem.insertBefore(genMatchDiv(primaryResult, scrape, scrapeType), elem.firstChild);
    } catch(err) {
      console.error('Failed to search profile', scrape, err);
    }
  });
}
