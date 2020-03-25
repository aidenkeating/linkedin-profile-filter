import test from 'tape-promise/tape';
import { JSDOM } from 'jsdom';
import { RecruiterProfilePageScrape } from './page-scraper';

const goodDoc = (new JSDOM(`<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <div class="profile-info">
        <h1 class="searchable">Aiden Keating</h1>
      </div>
      <div class="position">
        <h2 class="searchable">Software Engineer</h2>
        <h2 class="searchable">Red Hat</h2>
        <h2 class="date-range">2018 - Present</h2>
      </div>
      <div class="location">
        <a href="example.com?countryCode=us">United States</a>
      </div>
    </body>
  </html>`)).window.document;

const fallbackDoc = (new JSDOM(`<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <div class="profile-info">
        <h2 class="title">Software Engineer at Red Hat</h2>
      </div>
      <div class="position">
        <h2 class="date-range">2018 - Present</h2>
      </div>
      <div class="location">
        <a href="example.com">United States</a>
      </div>
    </body>
  </html>`)).window.document;

test('ensure recruiter profile scraper retrieves primary data if available', async (t) => {
  const scrape = new RecruiterProfilePageScrape(goodDoc);

  t.equals(scrape.name, 'Aiden Keating');
  t.equals(scrape.company[0], 'Red Hat');
  t.equals(scrape.location, 'us');
});

test('ensure recruiter profile scraper retrieves fallback data if primary is not found', async (t) => {
  const scrape = new RecruiterProfilePageScrape(fallbackDoc);

  t.equals(scrape.name, null);
  t.equals(scrape.company.length, 0);
  t.equals(scrape.location, 'United States');
});
