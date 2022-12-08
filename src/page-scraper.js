import { GenerateNamesForCompay } from "./companySuffix";
export class ProfilePageScrape {
  /**
   * @param {Document} document
   */
  constructor(document) {
    this.document = document;
    // console.log(this)
  }

  /**
   * @returns {string}
   */
  get name() {
    const nameElem = this.document.querySelector(
      "span[data-test-row-lockup-full-name]"
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
      "div[data-live-test-row-lockup-location]"
    );
    // console.log("location is", locElem)
    if (!locElem) {
      return;
    }
    const splitLoc = locElem.textContent.split("·");

    return splitLoc[splitLoc.length - 1].trim().toLowerCase();
  }

  /**
   * @returns {string}
   */
  get company() {
    const experienceElem = this.document.querySelector("section[data-test-profile-background-card]");
    if (!experienceElem) {
      return [];
    }
    // console.log("experience elem", experienceElem)

    const posElems = experienceElem.querySelectorAll(
      "div[data-test-position-list-container]"
    );
    if (!posElems) {
      return [];
    }
    // console.log("posElems", posElems)

    const lastPosElem = posElems[0]

    const posDateElem = lastPosElem.querySelector("span[data-test-position-entity-date-range]");
    if (
      !posDateElem ||
      !posDateElem.textContent.toLowerCase().includes("present")
    ) {
      return [];
    }
    let posNameElem = lastPosElem.querySelector(
      "a[data-test-position-entity-company-link]"
    );
    // // One experience in the latest company
    // if (!posNameElem) {
    //   return [
    //     lastPosElem
    //       .querySelector("p.pv-entity__secondary-title")
    //       .firstChild.wholeText.trim(),
    //   ];
    // }

    // Different layout if there is multiple experience in the same company
    return [posNameElem.textContent.trim()];
  }
}

export class RecruiterProfilePageScrape {
  /**
   * @param {Document} document
   */
  constructor(document) {
    this.document = document;
    // console.log(this)
  }

  /**
   * Retrieve the name of the profile.
   * @returns {string}
   */
  get name() {
    const profileContainer = this.document.getElementById("profile-container");
    if (!profileContainer) {
      return null;
    }
    const nameElem = profileContainer.querySelector(
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
    const profileContainer = this.document.getElementById("profile-container");
    if (!profileContainer) {
      return null;
    }
    const locationElem = profileContainer.querySelector(
      "div[data-test-row-lockup-location]"
    );
    if (!locationElem) {
      return;
    }

    const splitLoc = locationElem.textContent.split(/[·|,]/)

    return splitLoc[splitLoc.length - 1].trim().toLowerCase();
  }

  get company() {
    const prevPositionElems = this.document.querySelectorAll("div[data-test-group-position-list-container]");
    if (!prevPositionElems) {
      return [];
    }

    // console.log("the positions", prevPositionElems)
    const companies = Array.from(prevPositionElems).reduce(
      (acc, prevPositionElem) => {
        let prevPositionCompanyElem = prevPositionElem.querySelector(
          "strong[data-test-grouped-position-entity-company-name]"
        );

        // console.log("the prev company elem", prevPositionCompanyElem, prevPositionCompanyElem.textContent.trim())
        if (!prevPositionCompanyElem) {
          prevPositionCompanyElem = prevPositionElem.querySelector(
            "dd[data-test-position-entity-company-name]"
          );
        }
        if (!prevPositionCompanyElem) {
          return acc;
        }
        const prevPositionDateElem = prevPositionElem.querySelector(
          "span[data-test-grouped-position-entity-date-range]"
        );

        // console.log("Position length is", prevPositionDateElem.textContent)
        if (!prevPositionDateElem || !prevPositionDateElem.textContent.toLowerCase().includes("present")) {
          return acc;
        }
        // console.log("returning the present company")
        acc.push(prevPositionCompanyElem.textContent.trim());
        return acc;
      },
      []
    );

    // console.log("the companies", companies)
    return GenerateNamesForCompay(companies[0], this.location);
  }
}

export class RecruiterSearchOrPipelinePageScrape {
  constructor(resultElem) {
    this.resultElem = resultElem;
    // console.debug(this);
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
    const currentSection = this.resultElem.querySelector(
      ".history-group .ember-view"
    );

    // console.debug("the selection", currentSection)
    if (!currentSection) {
      // console.debug("found no selection")
      return [];
    }

    // Get all current positions
    const currentPos = currentSection.querySelectorAll(
      "li[data-test-description-description]"
    );
    // console.debug("the positions", currentPos)
    if (!currentPos) {
      // console.debug("found no current pos")
      return [];
    }

    let companies = [];

    currentPos.forEach((pos) => {
      // Check position is current
      const posDateElem = pos.querySelector(
        ".row-description-entry__date-duration"
      );

      if (!posDateElem || !posDateElem.textContent.toLowerCase().includes("present")) {
        // console.debug("didn't find present")
        return;
      }

      const posElem = pos.querySelector("span");
      const postSplit = posElem.textContent.trim().split(" at ");

      // There can be multiple "at" in postition title giving multiple companies - returning the last campany
      const company = postSplit[postSplit.length - 1];
      // console.debug("the company", company)

      const names = GenerateNamesForCompay(company, this.location);

      companies = companies.concat(names);
    });

    // console.debug("the companies", companies)
    return companies;
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
  // console.log("id is", elem.id, scrapeType)
  elem.style =
    "color: white; border-radius: 16px; border: 3px solid #d9534f; background-color: #d9534f; font-weight: bolder; text-align: center; margin: 5px;";
  elem.innerHTML = `${r.name} is a partner (${r.tier}) in ${
    r.fullLocation || r.isoLocation
  }`;
  return elem;
}
