import {
  RecruiterProfilePageScrape,
  genScrapeId,
  genMatchDiv,
} from "../src/page-scraper";

const scrapeType = "recruiterProfile";

function handleMessageResponse(msg, scrape) {
  if (!msg || !msg.matches || !!document.getElementById(genScrapeId(scrape, scrapeType))) {
    return;
  }

  const backgroundCardElem = document.querySelector(
    ".topcard-condensed__content"
  );
  if (!backgroundCardElem) {
    return;
  }
  const primaryMatch = msg.matches.find((m) => m.locationMatch);
  if (!primaryMatch) {
    return;
  }

  backgroundCardElem.insertBefore(
    genMatchDiv(primaryMatch, scrape, scrapeType),
    backgroundCardElem.firstChild
  );
}

// Initialize
export async function scrapeRecruiterProfilePage(messenger) {
  console.log("scraping recruiter profile page");

  const scrape = new RecruiterProfilePageScrape(document);
  if (!scrape.name || !scrape.location || !scrape.company) {
    return;
  }

  try {
    const results = await messenger.search({
      name: scrape.name,
      location: scrape.location,
      company: scrape.company,
    });
    handleMessageResponse(results, scrape);
  } catch (err) {
    console.error("Failed to check profile", err);
  }
}
