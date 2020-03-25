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
    const nameElem = this.document.querySelector('.inline.t-24.t-black.t-normal.break-words');
    if (!nameElem) {
      return;
    }
    return nameElem.textContent.trim();
  }

  /**
   * @returns {string}
   */
  get location() {
    const locElem = this.document.querySelector('.t-16.t-black.t-normal.inline-block');
    if (!locElem) {
      return;
    }
    const splitLoc = locElem.textContent.split(',');

    return splitLoc[splitLoc.length - 1].trim().toLowerCase();
  }

  /**
   * @returns {string}
   */
  get company() {
    const experienceElem = this.document.querySelector('.experience-section');
    if (!experienceElem) {
      return [];
    }
    const lastPosElem = experienceElem.querySelector('.pv-profile-section__list-item');
    if (!lastPosElem) {
      return [];
    }
    const posDateElem = lastPosElem.querySelector('.pv-entity__date-range');
    if (!posDateElem || !posDateElem.textContent.toLowerCase().includes('present')) {
      return [];
    }
    const posNameElem = lastPosElem.querySelector('.pv-entity__secondary-title');
    if (!posNameElem) {
      return [];
    }
    return [posNameElem.textContent.trim()];
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
    const nameElem = this.document.querySelector('.profile-info .searchable');
    if (!nameElem) {
      return null;
    }
    return nameElem.textContent;
  }

  /**
   * Retrieve the country. This will be done in two ways, with the following
   * precedence.
   * - The country code from the href URL of the country element.
   * - The text of the country from the country element.
   * @returns {string}
   */
  get location() {
    const locationElem = this.document.querySelector('.location');
    if (!locationElem) {
      return this.getFallbackCompany();
    }
    const locationUrlElem = locationElem.querySelector('a');
    if (!locationUrlElem) {
      return this.getFallbackLocation();
    }
    const locationUrl = locationUrlElem.getAttribute('href');
    if (!locationUrl) {
      return this.getFallbackLocation();
    }
    const countryCode = RecruiterProfilePageScrape.getQueryParam('countryCode', locationUrl);
    if (!countryCode) {
      return this.getFallbackLocation();
    }
    return countryCode;
  }

  get company() {
    const prevPositionElems = this.document.querySelectorAll('.position');
    if (!prevPositionElems) {
      return [];
    }
    const companies = Array.from(prevPositionElems).reduce((acc, prevPositionElem) => {
      const prevPositionInfoElems = prevPositionElem.querySelectorAll('.searchable');
      if (!prevPositionInfoElems || prevPositionInfoElems.length < 2) {
        return acc;
      }
      const prevPositionDateElem = prevPositionElem.querySelector('.date-range');
      if (!prevPositionDateElem || !prevPositionDateElem.textContent.toLowerCase().includes('present')) {
        return acc;
      }
      acc.push(prevPositionInfoElems[1].textContent);
      return acc;
    }, []);
    return companies;
  }

  /**
   * Retrieve the name of the company from the company element.
   * @returns {string}
   */
  getFallbackCompany() {
    const titleElem = this.document.querySelector('.title');
    if (!titleElem) {
      return null;
    }
    return titleElem.textContent.split(' at ')[1];
  }

  /**
   * Retrieve a location based on the text contents of the location element.
   * This is the name of the country, not the country code.
   * @returns {string} The name of the country
   */
  getFallbackLocation() {
    const locationElem = this.document.querySelector('.location');
    if (!locationElem) {
      return null;
    }
    const splitLocation = locationElem.textContent.split(',');
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
    const parsedName = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${parsedName}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results || !results[2]) {
      return null;
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}

export class RecruiterSearchPageScrape {
  constructor(resultElem) {
    this.resultElem = resultElem;
  }

  get name() {
    const nameElem = this.resultElem.querySelector('.name');
    if (!nameElem) {
      return;
    }
    return nameElem.textContent;
  }

  get location() {
    const locElem = this.resultElem.querySelector('.location');
    if (!locElem) {
      return;
    }
    const locNameElem = locElem.querySelector('span');
    if (!locNameElem) {
      return;
    }
    const splitLoc = locNameElem.textContent.split(',');

    return splitLoc[splitLoc.length - 1].trim().toLowerCase();
  }

  get company() {
    const posElems = this.resultElem.querySelectorAll('.curr-positions ol li');
    if (!posElems) {
      return;
    }
    const companies = Array.from(posElems).reduce((acc, posElem) => {
      let positionTextNodes = Array.from(posElem.childNodes);
      if (positionTextNodes.length === 0) {
        return acc;
      }
      if (positionTextNodes[positionTextNodes.length - 1].textContent.toLowerCase().includes(' present')) {
        positionTextNodes = positionTextNodes.slice(0, -1);
      }

      const posCompanyAtStr = positionTextNodes.map(n => n.textContent).join('');
      acc.push(posCompanyAtStr.split(' at ')[1]);
      return acc;
    }, []);
    return companies;
  }
}

export function genScrapeId(r) {
  return window.btoa(encodeURIComponent(`${r.name} ${r.company} ${r.location}`));
}

export function genMatchDiv(r, s) {
  const elem = document.createElement('div');
  elem.id = genScrapeId(s);
  elem.style = 'color: white; border-radius: 16px; border: 3px solid #d9534f; background-color: #d9534f; font-weight: bolder; text-align: center; margin: 5px;';
  elem.innerHTML = `${r.name} is a partner (${r.tier}) in ${r.fullLocation || r.isoLocation}`;
  return elem;
}