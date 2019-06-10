/* global chrome */
import { ProfilePageScrape } from '../src/page-scraper';

function buildTopCardNotification(criteria) {
  return `<div style="border: 3px solid red; text-align: center; margin: 5px;">
    <h4 style="color: red; font-style: italic; font-weight: bold;">${criteria.name} is a ${criteria.tier} partner in ${criteria.location}</h4>
  </div>`;
}

function handleMessageResponse(msg) {
  // The profile does not need to be filtered.
  if (!msg) {
    return;
  }
  const topCardElem = document.querySelector('.pv-top-card-v2-section__info');
  if (!topCardElem) {
    return;
  }
  topCardElem.innerHTML = `${buildTopCardNotification(msg)}${topCardElem.innerHTML}`;
}

// Initialize
const profileScraper = new ProfilePageScrape(document);
chrome.runtime.sendMessage({ profileScraper }, handleMessageResponse);
