import test from "tape-promise/tape";
import { JSDOM } from "jsdom";
import { RecruiterProfilePageScrape, RecruiterSearchOrPipelinePageScrape } from "./page-scraper";

const goodDoc = new JSDOM(`<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <div id="profile-container">
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
      </div>
    </body>
  </html>`).window.document;

const searchMultipleCurrentPositionsDoc = new JSDOM(
`
<div id="ember2762" class="standard-profile-row ember-view">
    <article id="ember2763" class="row ember-view">
      <div class="row__top-section">
          <div class="row__card">
            <div class="row__top-card">
                <section id="ember2764" class="lockup ember-view">
                  <div id="ember2765" class="artdeco-entity-lockup artdeco-entity-lockup--size-5 ember-view">
                      <div id="ember2768" class="artdeco-entity-lockup__content lockup__content ember-view">
                        <span class="lockup__content-title">
                            <span data-test-row-lockup-full-name="" data-live-test-row-lockup-full-name="">
                              <div id="ember2769" class="artdeco-entity-lockup__title ember-view">
                                  Test User
                                  </a>
                              </div>
                            </span>
                            <span data-test-lockup-degree="">
                              <div id="ember2771" class="artdeco-entity-lockup__badge ember-view">
                                  <span class="a11y-text">Third degree connection</span>
                                  <span class="artdeco-entity-lockup__degree" aria-hidden="true">
                                  ·&nbsp;3rd
                                  </span>
                                  <!----><!---->
                              </div>
                            </span>
                            <!---->                  
                            <div id="ember2772" class="ember-view">
                              <div id="ember2773" class="artdeco-entity-lockup artdeco-entity-lockup--size-7 ember-view">
                                  <span data-test-premium-badge="">
                                    <div id="ember2774" class="artdeco-entity-lockup__badge ember-view">
                                        <!---->  &nbsp;
                                        <li-icon aria-hidden="true" type="linkedin-premium-gold-icon" size="small">
                                          <svg viewBox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveAspectRatio="xMinYMin meet" class="artdeco-icon" focusable="false">
                                              <g class="small-icon" style="fill-opacity: 1">
                                                <path d="M13.75,1H2.25A1.25,1.25,0,0,0,1,2.25v11.5A1.25,1.25,0,0,0,2.25,15h11.5A1.25,1.25,0,0,0,15,13.75V2.25A1.25,1.25,0,0,0,13.75,1Z" style="fill: #9f8333"></path>
                                                <path d="M4,2.68A1.36,1.36,0,0,0,2.69,4,1.36,1.36,0,0,0,4,5.31,1.36,1.36,0,0,0,5.31,4,1.36,1.36,0,0,0,4,2.68Z" style="fill: #fff"></path>
                                                <rect x="3" y="6" width="2" height="7" style="fill: #fff"></rect>
                                                <path d="M10.25,5.88a3,3,0,0,0-2.31,1H7.88V6H6v7H8V10c0-1.17.48-2,1.62-2,.91,0,1.38.66,1.38,2v3h2V8.88C13,7,12.21,5.88,10.25,5.88Z" style="fill: #fff"></path>
                                              </g>
                                          </svg>
                                        </li-icon>
                                        <!---->
                                    </div>
                                  </span>
                                  <!----><!----><!----><!----><!----><!----><!----><!----><!----><!----><!---->
                              </div>
                            </div>
                            <!----><!---->
                            <!---->
                        </span>
                        <div id="ember2775" class="artdeco-entity-lockup__subtitle ember-view">        <span data-test-row-lockup-headline="" data-live-test-row-lockup-headline="">
                            Recruiter at <em class="sh">Company 1</em>
                            </span>
                        </div>
                        <!---->
                        <div id="ember2776" class="artdeco-entity-lockup__metadata ember-view">
                            <div data-test-row-lockup-location="" data-live-test-row-lockup-location="">
                              Ireland
                            </div>
                            <span data-test-current-employer-industry="" data-live-test-current-employer-industry="">
                            Information Technology and Services
                            </span>
                            <!---->      <!---->
                            <span id="ember2777" class="row-lockup-details ember-view">
                              <!---->
                              <!----><!---->
                            </span>
                        </div>
                      </div>
                  </div>
                </section>
            </div>
            <dl id="ember2778" class="history ember-view">
                <div id="ember2779" class="history-group ember-view">
                  <dt data-test-description-entry-term="" class="history-group__term t-14 t-black t-bold">
                      <dfn data-test-history-group-definition="" class="history-group__definition" aria-hidden="true">
                      Current
                      </dfn>
                      <dfn class="a11y-text">
                      Profile current positions
                      </dfn>
                  </dt>
                  <!---->
                  <div data-test-expandable-items="" id="ember2780" class="ember-ts-expandable-list ember-view">
                      <dd id="ember2781" class="history-group__description t-14 t-black t-normal ember-view">
                        <!---->
                        <span>Senior Recruiter at <em class="sh">Company 1</em></span>
                        <span aria-hidden="true">·</span>
                        <span class="row-description-entry__date-duration" data-test-description-entry-date-duration="">
                        <time>2019</time> – Present
                        </span>
                      </dd>
                      <dd id="ember2782" class="history-group__description t-14 t-black t-normal ember-view">
                        <!---->
                        <span>Recruitment Analyst at <em class="sh">Company 2</em></span>
                        <span aria-hidden="true">·</span>
                        <span class="row-description-entry__date-duration" data-test-description-entry-date-duration="">
                        <time>2018</time> – Present
                        </span>
                      </dd>
                      <!---->
                  </div>
                </div>
                <div id="ember2783" class="history-group ember-view">
                  <dt data-test-description-entry-term="" class="history-group__term t-14 t-black t-bold">
                      <dfn data-test-history-group-definition="" class="history-group__definition" aria-hidden="true">
                      Past
                      </dfn>
                      <dfn class="a11y-text">
                      Profile past positions
                      </dfn>
                  </dt>
                  <!---->
                  <div data-test-expandable-items="" id="ember2784" class="ember-ts-expandable-list ember-view">
                      <dd id="ember2785" class="history-group__description t-14 t-black t-normal ember-view">
                        <!---->
                        <span>Account Manager at Past Experince 1</span>
                        <span aria-hidden="true">·</span>
                        <span class="row-description-entry__date-duration" data-test-description-entry-date-duration="">
                        <time>2017</time> – <time>2018</time>
                        </span>
                      </dd>
                      <!---->
                  </div>
                </div>
                <div id="ember2786" class="history-group ember-view">
                  <dt data-test-description-entry-term="" class="history-group__term t-14 t-black t-bold">
                      <dfn data-test-history-group-definition="" class="history-group__definition" aria-hidden="true">
                      Education
                      </dfn>
                      <dfn class="a11y-text">
                      Profile education
                      </dfn>
                  </dt>
                  <!---->
                  <div data-test-expandable-items="" id="ember2787" class="ember-ts-expandable-list ember-view">
                      <dd id="ember2788" class="history-group__description t-14 t-black t-normal ember-view">
                        <!---->
                        <span>Education 1, Diploma</span>
                        <span aria-hidden="true">·</span>
                        <span class="row-description-entry__date-duration" data-test-description-entry-date-duration="">
                        <time>2019</time> – <time>2020</time>
                        </span>
                      </dd>
                      <dd id="ember2789" class="history-group__description t-14 t-black t-normal ember-view">
                        <!---->
                        <span>Education 2, Diploma</span>
                        <span aria-hidden="true">·</span>
                        <span class="row-description-entry__date-duration" data-test-description-entry-date-duration="">
                        <time>2018</time> – <time>2019</time>
                        </span>
                      </dd>
                  </div>
                </div>
            </dl>
          </div>
      </div>
    </article>
</div>
`).window.document;

// Tests for RecruiterProfilePageScrape
test("ensure recruiter profile scraper retrieves primary data if available", async (t) => {
  const scrape = new RecruiterProfilePageScrape(goodDoc);

  t.equals(scrape.name, "Aiden Keating");
  t.equals(scrape.company[0], "Red Hat");
  t.equals(scrape.location, "united states");
});

// Tests for RecruiterSearchOrPipelinePageScrape
test("ensure recruiter search scraper retrieves primary data if available", async (t) => {
  const scrape = new RecruiterSearchOrPipelinePageScrape(searchMultipleCurrentPositionsDoc);
  
  t.equals(scrape.name, "Test User");
  t.equals(scrape.company.length, 2);
  t.equals(scrape.company[0], "Company 1");
  t.equals(scrape.company[1], "Company 2");
  t.equals(scrape.location, "ireland");
});

