/* global chrome */

export class SheetRange {
  /**
   * A SheetRange or ValueRange in a Google Sheet.
   * @param {string} range
   * @param {string} majorDimension
   * @param {string[]} values
   */
  constructor(range, majorDimension, values) {
    this.range = range;
    this.majorDimension = majorDimension;
    this.values = values;
  }

  static fromJSON(json) {
    if (!json.range || !json.majorDimension || !json.values) {
      console.error('Invalid JSON for building SheetRange', json);
      return null;
    }
    return new SheetRange(json.range, json.majorDimension, json.values);
  }
}

export class SheetRangeSet {
  /**
   * A collection of SheetRange in a Google Sheet.
   * @param {string} id
   * @param {SheetRange[]} ranges
   */
  constructor(id, ranges) {
    this.id = id;
    this.ranges = ranges;
  }

  /**
   * Create a SheetRangeSet from a standard JavaScript Object or a JSON object.
   * @param {Object} json The JSON to convert to a SheetRange.
   * @returns {SheetRangeSet} New SheetRangeSet.
   */
  static fromJSON(json) {
    if (!json.spreadsheetId || !json.valueRanges) {
      console.error('Invalid JSON for building SheetRangeSet', json);
      return null;
    }
    const ranges = json.valueRanges.map(r => SheetRange.fromJSON(r));
    return new SheetRangeSet(json.spreadsheetId, ranges);
  }
}

export class GoogleSheets {
  /**
   * A Google Sheets client.
   * @param {Function} generateToken Function to retrieve a Google Sheets token.
   */
  constructor(generateToken) {
    this.generateToken = generateToken;
    this.baseUrl = 'https://sheets.googleapis.com/v4';
  }

  /**
   * @param {string} sheetId
   * @param {string[]} ranges
   * @returns {Promise<SheetRangeSet>}
   */
  async getRangeSets(sheetId, ranges) {
    const parsedRanges = ranges.join('&ranges=');
    const url = `${this.baseUrl}/spreadsheets/${sheetId}/values:batchGet?ranges=${parsedRanges}`;
    const headers = await this.getRequestHeaders();
    let resp = await fetch(url, { headers });
    if (resp.status === 401) {
      await this.removeCachedToken();
      const newHeaders = this.getRequestHeaders();
      resp = fetch(url, { headers: newHeaders });
    }
    const parsedResp = await resp.json();
    const sheetRanges = await SheetRangeSet.fromJSON(parsedResp);
    return sheetRanges;
  }

  /**
   * Delete the currently cached token using chrome.identity. This forces a new
   * token to be created next time a Google Sheets activity is invoked.
   * @returns {Promise<void>}
   */
  async removeCachedToken() {
    const token = await this.generateToken();
    return new Promise(resolve => chrome.identity.removeCachedAuthToken({ token }, resolve));
  }

  /**
   * @returns {Promise<Object>}
   */
  async getRequestHeaders() {
    const token = await this.generateToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
}
