/**
 * Main content script page scrapers due to LinkedIn UI is a Single Page Application
 */

import ChromeMessenger from "../src/messenger";
import { scrapeRecruiterSearchPage } from "./li-recruiter-search-page";
import { scrapeRecruiterProfilePage } from "./li-recruiter-profile-page";
import { scrapeProfilePage } from "./li-profile-page";
import { scrapeRecruiterPipelinePage } from "./li-recruiter-pipeline-page";

const messenger = new ChromeMessenger();

scrapeRecruiterSearchPage(messenger).then(() =>
  setInterval(scrapeRecruiterSearchPage.bind(null, messenger), 2500)
);

scrapeRecruiterProfilePage(messenger).then(() =>
  setInterval(scrapeRecruiterProfilePage.bind(null, messenger), 2500)
);

scrapeProfilePage(messenger).then(() =>
  setInterval(scrapeProfilePage.bind(null, messenger), 2500)
);

scrapeRecruiterPipelinePage(messenger).then(() =>
  setInterval(scrapeRecruiterPipelinePage.bind(null, messenger), 2500)
);
