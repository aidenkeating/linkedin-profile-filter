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
    const experienceElem = this.document.getEle("#experience-section");
    if (!experienceElem) {
      return [];
    }
    console.log(experienceElem);
    const lastPosElem = experienceElem.querySelector(
      ".pv-profile-section__list-item"
    );
    if (!lastPosElem) {
      return [];
    }
    const posDateElem = lastPosElem.querySelector(".pv-entity__date-range");
    if (
      !posDateElem ||
      !posDateElem.textContent.toLowerCase().includes("present")
    ) {
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

    // Different layment with multiple experience in the same company
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
      "a[data-test-link-to-profile-link]"
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
    // if (!locationElem) {
    //   return this.getFallbackCompany();
    // }
    // const locationUrlElem = locationElem.querySelector('a');
    // if (!locationUrlElem) {
    //   return this.getFallbackLocation();
    // }
    // const locationUrl = locationUrlElem.getAttribute('href');
    // if (!locationUrl) {
    //   return this.getFallbackLocation();
    // }
    // const countryCode = RecruiterProfilePageScrape.getQueryParam('countryCode', locationUrl);
    // if (!countryCode) {
    //   return this.getFallbackLocation();
    // }
    // return countryCode;

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
        const prevPositionInfoElem = prevPositionElem.querySelector(
          ".position-item__company-link"
        );
        if (!prevPositionInfoElem) {
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
        acc.push(prevPositionInfoElem.textContent.trim());
        return acc;
      },
      []
    );
    return companies;
  }

  /**
   * Retrieve the name of the company from the company element.
   * @returns {string}
   */
  getFallbackCompany() {
    const titleElem = this.document.querySelector(".title");
    if (!titleElem) {
      return null;
    }
    return titleElem.textContent.split(" at ")[1];
  }

  /**
   * Retrieve a location based on the text contents of the location element.
   * This is the name of the country, not the country code.
   * @returns {string} The name of the country
   */
  getFallbackLocation() {
    const locationElem = this.document.querySelector(".location");
    if (!locationElem) {
      return null;
    }
    const splitLocation = locationElem.textContent.split(",");
    return splitLocation[splitLocation.length - 1].trim();
  }

  /**
   * Helper function for retrieving a query param from a URL.
   * @param {string} name The name of the query param.
   * @param {string} url The URL to retrieve the query param from.
   * @returns {string}
   */
  static getQueryParam(name, url) {
    if (!name || !url) {
      return null;
    }
    const parsedName = name.replace(/[[\]]/g, "\\$&");
    const regex = new RegExp(`[?&]${parsedName}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results || !results[2]) {
      return null;
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}

export class RecruiterSearchPageScrape {
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
    const currentPos = this.resultElem.querySelector(
      ".history-group__description"
    );
    if (!currentPos) {
      return [];
    }
    //   const companies = Array.from(posElems).reduce((acc, posElem) => {
    //     let positionTextNodes = Array.from(posElem.childNodes);
    //     if (positionTextNodes.length === 0) {
    //       return acc;
    //     }
    //     if (positionTextNodes[positionTextNodes.length - 1].textContent.toLowerCase().includes(' present')) {
    //       positionTextNodes = positionTextNodes.slice(0, -1);
    //     }

    //     const posCompanyAtStr = positionTextNodes.map(n => n.textContent).join('');
    //     acc.push(posCompanyAtStr.split(' at ')[1]);
    //     return acc;
    //   }, []);
    //   return companies;
    const posElem = currentPos.querySelector("span");
    return [posElem.textContent.trim().split(" at ")[1]];
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
