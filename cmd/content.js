/**
 * Main content script page scrapers due to LinkedIn UI is a Single Page Application
 */

import ChromeMessenger from "../src/messenger";
import { scrapeRecruiterSearchPage } from "./li-recruiter-search-page";
import { scrapeRecruiterProfilePage } from "./li-recruiter-profile-page";
import { scrapeProfilePage } from "./li-profile-page";

const messenger = new ChromeMessenger();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "recruiterSearch") {
    console.log("Loading recruiter search script");
    scrapeRecruiterSearchPage(messenger).then(() =>
      setInterval(scrapeRecruiterSearchPage.bind(null, messenger), 2500)
    );
  }

  if (msg == "recruiterProfile") {
    console.log("Loading recruiter profile script");
    scrapeRecruiterProfilePage(messenger).then(() =>
      setInterval(scrapeRecruiterProfilePage.bind(null, messenger), 2500)
    );
  }

  if (msg == "individualProfile") {
    console.log("Loading individual profile script");
    scrapeProfilePage(messenger).then(() =>
      setInterval(scrapeProfilePage.bind(null, messenger), 2500)
    );
  }
});
