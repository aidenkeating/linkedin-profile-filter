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
    return this.document.querySelector('.pv-top-card-section__name').textContent;
  }

  /**
   * @returns {string}
   */
  get location() {
    return this.document.querySelector('.pv-top-card-section__location').textContent;
  }

  /**
   * @returns {string}
   */
  get company() {
    return this.document.querySelector('.pv-top-card-v2-section__company-name').textContent;
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
    const prevPositionElem = this.document.querySelector('.position');
    if (!prevPositionElem) {
      return this.getFallbackCompany();
    }
    const prevPositionInfoElems = prevPositionElem.querySelectorAll('.searchable');
    if (!prevPositionInfoElems || prevPositionInfoElems.length < 2) {
      return this.getFallbackCompany();
    }
    const prevPositionDateElem = this.document.querySelector('.position').querySelector('.date-range');
    if (!prevPositionDateElem || !prevPositionDateElem.textContent.toLowerCase().includes('present')) {
      return this.getFallbackCompany();
    }
    return prevPositionInfoElems[1].textContent;
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
