import { GenerateNamesForCompay } from "./companySuffix";
export class ProfilePageScrape {
  /**
   * @param {Document} document
   */
  constructor(document) {
    this.document = document;
  }

  /**
   * @returns {string}
   */
  get name() {
    const nameElem = this.document.querySelector(
      ".inline.t-24.t-black.t-normal.break-words"
    );
    if (!nameElem) {
      return;
    }
    return nameElem.textContent.trim();
  }

  /**
   * @returns {string}
   */
  get location() {
    const locElem = this.document.querySelector(
      ".t-16.t-black.t-normal.inline-block"
    );
    if (!locElem) {
      return;
    }
    const splitLoc = locElem.textContent.split(",");

    return splitLoc[splitLoc.length - 1].trim().toLowerCase();
  }

  /**
   * @returns {string}
   */
  get company() {
    const experienceElem = this.document.getElementById("experience-section");
    if (!experienceElem) {
      return [];
    }
    const lastPosElem = experienceElem.querySelector(
      ".pv-profile-section__list-item"
    );
    if (!lastPosElem) {
      return [];
    }
    const posDateElem = lastPosElem.querySelector(".pv-entity__date-range");
    if (!posDateElem ||!posDateElem.textContent.toLowerCase().includes("present")) {
      return [];
    }
    let posNameElem = lastPosElem.querySelector(
      ".pv-entity__company-summary-info"
    );
    // One experience in the latest company
    if (!posNameElem) {
      return [
        lastPosElem
          .querySelector("p.pv-entity__secondary-title")
          .firstChild.wholeText.trim(),
      ];
    }

    // Different layout if there is multiple experience in the same company
    return [posNameElem.querySelectorAll("span")[1].textContent.trim()];
  }
}

export class RecruiterProfilePageScrape {
  /**
   * @param {Document} document
   */
  constructor(document) {
    this.document = document;
  }

  /**
   * Retrieve the name of the profile.
   * @returns {string}
   */
  get name() {
    const nameElem = this.document.querySelector(
      "span[data-test-row-lockup-full-name]"
    );
    if (!nameElem) {
      return null;
    }
    return nameElem.textContent.trim();
  }

  /**
   * Retrieve the country. This will be done in two ways, with the following
   * precedence.
   * - The country code from the href URL of the country element.
   * - The text of the country from the country element.
   * @returns {string}
   */
  get location() {
    const locationElem = this.document.querySelector(
      "div[data-test-row-lockup-location]"
    );
    if (!locationElem) {
      return;
    }

    const splitLoc = locationElem.textContent.split(",");

    return splitLoc[splitLoc.length - 1].trim().toLowerCase();
  }

  get company() {
    const prevPositionElems = this.document.querySelectorAll(".position-item");
    if (!prevPositionElems) {
      return [];
    }
    const companies = Array.from(prevPositionElems).reduce(
      (acc, prevPositionElem) => {
        const prevPositionCompanyElem = prevPositionElem.querySelector(
          "dd[data-test-position-entity-company-name]"
        );
        if (!prevPositionCompanyElem) {
          return acc;
        }
        const prevPositionDateElem = prevPositionElem.querySelector(
          "span[data-test-position-entity-date-range]"
        );
        if (
          !prevPositionDateElem ||
          !prevPositionDateElem.textContent.toLowerCase().includes("present")
        ) {
          return acc;
        }
        acc.push(prevPositionCompanyElem.textContent.trim());
        return acc;
      },
      []
    );
    return GenerateNamesForCompay(companies[0], this.location);
  }
}

export class RecruiterSearchOrPipelinePageScrape {
  constructor(resultElem) {
    this.resultElem = resultElem;
  }

  get name() {
    const nameElem = this.resultElem.querySelector(
      ".artdeco-entity-lockup__title"
    );
    if (!nameElem) {
      return;
    }
    return nameElem.textContent.trim();
  }

  get location() {
    const locElem = this.resultElem.querySelector(
      ".artdeco-entity-lockup__metadata"
    );
    if (!locElem) {
      return;
    }
    const locNameElem = locElem.querySelector("div");
    if (!locNameElem) {
      return;
    }
    const splitLoc = locNameElem.textContent.trim().split(",");

    return splitLoc[splitLoc.length - 1].trim().toLowerCase();
  }

  get company() {
    // Get current selection
    const currentSection = this.resultElem.querySelector(".history-group .ember-view")
    if (!currentSection) {
      return [];
    }

    // Get all current positions
    const currentPos = currentSection.querySelectorAll(
      ".history-group__description"
    );
    if (!currentPos) {
      return [];
    }

    let companies = []

    currentPos.forEach( pos => {
      // Check position is current
      const posDateElem = pos.querySelector(
        ".row-description-entry__date-duration"
      );

      if (!posDateElem ||!posDateElem.textContent.toLowerCase().includes("present")) {
        return;
      }

      const posElem = pos.querySelector("span");
      const postSplit = posElem.textContent.trim().split(" at ")
  
      // There can be multiple "at" in postition title giving multiple companies - returning the last campany
      const company = postSplit[postSplit.length - 1]

      const names = GenerateNamesForCompay(company, this.location);

      companies = companies.concat(names)
    })

    return companies
  }
}

export function genScrapeId(r, scrapeType) {
  return window.btoa(
    encodeURIComponent(`${r.name} ${r.company} ${r.location} ${scrapeType}`)
  );
}

export function genMatchDiv(r, s, scrapeType) {
  const elem = document.createElement("div");
  elem.id = genScrapeId(s, scrapeType);
  elem.style =
    "color: white; border-radius: 16px; border: 3px solid #d9534f; background-color: #d9534f; font-weight: bolder; text-align: center; margin: 5px;";
  elem.innerHTML = `${r.name} is a partner (${r.tier}) in ${
    r.fullLocation || r.isoLocation
  }`;
  return elem;
}
