import { RecruiterSearchPageScrape } from "../src/page-scraper";
import ChromeMessenger from "../src/messenger";

const messenger = new ChromeMessenger();
async function scrapePage(messenger) {
  const resultListElem = document.getElementById('search-results');
  if (!resultListElem) {
    return;
  }
  const resultElems = resultListElem.querySelectorAll('.search-result');
  if (!resultElems || resultElems.length === 0) {
    return;
  }
  //clearInterval(intervalId);
  Array.from(resultElems).filter(re => !re.querySelector('.linkedin-profile-filter')).forEach(async (resultElem) => {
    const scrape = new RecruiterSearchPageScrape(resultElem);
    if (!scrape.name || !scrape.location || !scrape.company) {
      return;
    }
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
      if (!!resultElem.querySelector('.linkedin-profile-filter')) {
        return;
      }
      resultElem.innerHTML = `
        <div class="linkedin-profile-filter" style="border: 3px solid red; color: red; padding: 5px; font-weight: bold; margin: 5px;">
          ${primaryResult.name} is a partner (${primaryResult.tier}) in ${primaryResult.fullLocation || primaryResult.isoLocation}
        </div>
        ${resultElem.innerHTML}`;
      const actionsElem = resultElem.querySelector('.result-actions');
      actionsElem.style['margin-top'] = '50px';
    } catch(err) {
      console.error('Failed to search profile', scrape, err);
    }
  });
}

setInterval(scrapePage.bind(null, messenger), 100);
scrapePage(messenger);
