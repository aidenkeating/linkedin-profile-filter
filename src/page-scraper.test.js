import test from 'tape-promise/tape';
import { JSDOM } from 'jsdom';
import { RecruiterProfilePageScrape } from './page-scraper';

const goodDoc = (new JSDOM(`<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <span data-test-row-lockup-full-name>
        Aiden Keating
      </span>
      <div data-test-row-lockup-location>
      United States
      </div>
      <div class="position-item">
        <h2 class="searchable">Software Engineer</h2>
        <a class="position-item__company-link">Red Hat</a>
        <span data-test-position-entity-date-range>2018 - Present</h2>
      </div>
    </body>
  </html>`)).window.document;

test('ensure recruiter profile scraper retrieves primary data if available', async (t) => {
  const scrape = new RecruiterProfilePageScrape(goodDoc);

  t.equals(scrape.name, 'Aiden Keating');
  t.equals(scrape.company[0], 'Red Hat');
  t.equals(scrape.location, 'united states');
});


