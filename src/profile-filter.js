import { commonFactories } from "./companySuffix";

export class RegexAltNameFactory {
  constructor(matches, additionalFactories) {
    this.matches = matches;
    this.additionalFactories = additionalFactories || [];
  }

  /**
   * @param {string} name
   * @returns {boolean}
   */
  canParse(name) {
    return this.matches.find(m => new RegExp(m, 'i').test(name.toLowerCase()));
  }

  /**
   * @param {string} name
   * @returns {string[]}
   */
  parse(name) {
    const additionalFactory = this.additionalFactories.find(f => f.canParse(name));
    const altNames = [...this.matches];
    if (additionalFactory) {
      altNames.push(...additionalFactory.parse(name));
    }
    return altNames;
  }
}

export class DefaultAltNameFactory {
  constructor(substring, opts) {
    this.substring = substring.toLowerCase();
    this.opts = opts;
  }

  /**
   * @returns {boolean}
   */
  canParse(name) {
    if (this.opts && this.opts.endsWith) {
      return name.toLowerCase().endsWith(this.substring);
    }
    return name.toLowerCase().includes(this.substring);
  }

  parse(name) {
    if (this.opts && this.opts.endsWith) {
      return [DefaultAltNameFactory.toMatchRegExp(name.toLowerCase().split(this.substring)[0].replace(/(^,)|(,$)/g, ''))];
    }
    return [DefaultAltNameFactory.toMatchRegExp(name.toLowerCase().replace(this.substring, '').trim().replace(/(^,)|(,$)/g, ''))];
  }

  static toMatchRegExp(str) {
    return `^${str}$`;
  }
}

export class CompanyNameParser {
  constructor() {
    const basicFactories = Array.from(commonFactories.reduce((acc, company) => {
        acc.push(new DefaultAltNameFactory(company.suffix, { endsWith: company.endsWith }))
        return acc
    }, []));
    /* eslint-disable no-useless-escape */
    this.altNameFactories = [
      new RegexAltNameFactory([
        '^atos$',
        '^atos\\\s+.*',
      ], basicFactories),
      new RegexAltNameFactory([
        '^accenture$',
        '^accenture\\\s+.*',
      ], basicFactories),
      new RegexAltNameFactory([
        '^ibm$',
        '^ibm\\\s+.*',
      ], basicFactories),
      new RegexAltNameFactory([
        '^hewlett-packard$',
        '^hewlett\\\spackard$',
        '^hewlett-packard\\\s+.*',
        '^hewlett\\\spackard\\\s+.*',
        '^hp$',
      ], basicFactories),
      ...basicFactories,
    ];
    /* eslint-enable no-useless-escape */
  }

  /**
   * @param {string} name
   */
  getAltNamesFor(name) {
    const factory = this.altNameFactories.find(f => f.canParse(name));
    if (!factory) {
      return [];
    }
    return factory.parse(name);
  }
}

export class FilterCriteriaReadOptions {
  /**
   * Options for reading Google Sheets.
   * @param {string} id Google Sheet ID.
   * @param {string[]} nameRange Google Sheet range for company names.
   * @param {string[]} locationRange Google Sheet range for location names.
   * @param {string[]} tierRange Google Sheet range for tier names.
   */
  constructor(id, nameRange, locationRange, tierRange) {
    this.id = id;
    this.nameRange = nameRange;
    this.locationRange = locationRange;
    this.tierRange = tierRange;
  }
}

export class FilterCriteria {
  constructor(name, location, tier, altNames) {
    this.name = name;
    this.location = location;
    this.tier = tier;
    this.altNames = altNames;
  }
}

export class FilterCriteriaClient {
  /**
   * A client for retrieving FilterCriteria from Google Sheets.
   * @param {GoogleSheets} sheetsClient
   * @param {FilterCriteriaReadOptions[]} readOptions
   */
  constructor(sheetsClient, readOptions) {
    this.sheetsClient = sheetsClient;
    this.readOptions = readOptions;
    // NOTE: This should be a param.
    this.tierBlacklist = ['Unaffiliated'];
    // NOTE: This should be a param.
    this.nameParser = new CompanyNameParser();
  }

  /**
   * @returns {FilterCriteria[]}
   */
  getFilterCriteria() {
    return Promise.all(this.readOptions.map((ro) => {
      const ranges = [ro.nameRange, ro.locationRange, ro.tierRange];
      return this.sheetsClient.getRangeSets(ro.id, ranges);
    })).then(rangeSets => rangeSets.reduce((acc, rs) => {
      acc.push(...this.buildFilterCriteriaFromRangeSet(rs));
      return acc;
    }, []));
  }

  /**
   * Convert a SheetRangeSet to a list of FilterCriteria.
   * @param {SheetRangeSet} rangeSet
   * @returns {FilterCriteria[]}
   */
  buildFilterCriteriaFromRangeSet(rangeSet) {
    const nameVals = rangeSet.ranges[0] ? rangeSet.ranges[0].values : [];
    const locVals = FilterCriteriaClient.padArray(rangeSet.ranges[1]
      ? rangeSet.ranges[1].values
      : [], nameVals.length);
    const tierVals = FilterCriteriaClient.padArray(rangeSet.ranges[2]
      ? rangeSet.ranges[2].values
      : [], nameVals.length);

    return nameVals.map((_, i) => {
      if (!nameVals[i][0] || !locVals[i][0] || !tierVals[i][0]
        || this.tierBlacklist.includes(tierVals[i][0])) {
        return null;
      }
      const altNames = this.nameParser.getAltNamesFor(nameVals[i][0]);
      return new FilterCriteria(nameVals[i][0], locVals[i][0], tierVals[i][0], altNames);
    }).filter(c => !!c);
  }

  static padArray(arr, len) {
    return arr.concat(Array(len).fill([])).slice(0, len);
  }
}