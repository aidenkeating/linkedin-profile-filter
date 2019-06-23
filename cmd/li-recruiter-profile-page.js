import { RecruiterProfilePageScrape } from '../src/page-scraper';
import ChromeMessenger from '../src/messenger';

function buildBackgroundCardNotification(matches) {
  if (!matches || !matches.length > 0) {
    return null;
  }
  const primaryMatchIdx = matches.findIndex(m => m.locationMatch);
  const primaryMatch = matches[primaryMatchIdx] || matches[0];
  const secondaryMatches = matches.filter((_, i) => i !== primaryMatchIdx);

  let html = `<div id="linkedin-profile-filter-status" style="float: right; border: 3px solid red; padding: 5px; margin: 5px; color: red; font-weight: bold;">
    ${primaryMatch.name} is a partner (${primaryMatch.tier}) in ${primaryMatch.fullLocation || primaryMatch.isoLocation} ${matches.length > 1 ? '<a onclick="document.querySelectorAll(\'.profile-filter-secondary\').forEach(e => e.style.display=\'inline-block\')">and others</a>' : ''}
  </div>`;
  if (secondaryMatches.length > 0) {
    html += '<div class="profile-filter-secondary" style="display: none; width: 100%;">';
    secondaryMatches.forEach((m) => {
      html += `<div style="border: 3px solid red; padding: 5px; margin: 5px; color: red; font-weight: bold;">
      ${m.name} is a partner (${m.tier}) in ${m.fullLocation || m.isoLocation}</div>`;
    });
    html += '</div>';
  }
  return html;
}

function handleMessageResponse(msg) {
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
  if (!msg.matches.find(m => m.locationMatch)) {
    return;
  }
  backgroundCardElem.innerHTML = `${backgroundCardElem.innerHTML}${buildBackgroundCardNotification(msg.matches)}`;
}

// Initialize
const messenger = new ChromeMessenger();
async function scrapePage(messenger) {
  const profileScraper = new RecruiterProfilePageScrape(document);
  if (!profileScraper.name || !profileScraper.location
    || !profileScraper.company) {
    return;
  }

  try {
    const results = await messenger.search({
      name: profileScraper.name,
      location: profileScraper.location,
      company: profileScraper.company
    });
    handleMessageResponse(results);
  } catch (err) {
    console.error('Failed to check profile', err);
  }
}

setInterval(scrapePage.bind(null, messenger), 100);
scrapePage(messenger);
