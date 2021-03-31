/* global chrome */

import { countryIsoMap, isoCountryMap } from "../src/countries";
import { GoogleSheets } from "../src/sheets-client";
import {
  FilterCriteriaReadOptions,
  FilterCriteriaClient,
} from "../src/profile-filter";
import * as config from "../config.json";
import Fuse from "fuse.js";

const fuseOptions = {
  threshold: 0.3,
  keys: ["name"],
};

const iconDataUri =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAB3RJTUUH4wYbCyEk6JX4YQAADlVJREFUeNrt3XuwXWV5x/HPWvskJNwSdiBc5SJCCEqFqIioOK2UIqJSYKSoxaFjbWu9TL0Up7UqVkeRShVvtdCWEVQKra2iRamKd6J4qVdAQQ1IAkQWJCSSy9nr7R/P2hAOycm57L3XPifrO7PmZE7O3ut91/tbz/u87/u8z0tDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0PDbCOruwB1UfBYnIOnIscqfL+6bsK9bcq6y9lvhl4ABQvxBByKXXEffo5bsLY9+e/LcCLegSeJxu/Swf24Dd/C9bgRq9rxf7OOoRVAwVw8H3+JZditKm8pGukH+C98CrdPRAhFNPYLcSEOmMBHNuIX+Bo+j+W4azZZhqEUQME8vA7niYbfFiV+io/iP/GrbTVOwU44F2/DXlMo1kZheb6Aa/BdrJmsBRo2hk4AlYl+Bd6NnSf4sRK3CovwGdyMNRitvmMJXo6XYJceFPMBfE9Yn//Bbe2414xjGAXwNFyN/af4FWuE2V6B9dhH+BCL+1DfEr/G/+Iq3NAOccwYhkoABfNxmeinZxrrhI9wJT6HlW1S3YXaHsMmgJPE27973WWZBqPCL7mqqsutw+w0Do0ACkZwKV5ad1l6RMIv8R+4HDcN41BymARwpDCdj6m7LH3gdtE1/Ct+NkxdQz79r+gZzzaxsflM5EC8QYxQzivYt+4CdRkKC1DEUO1qnFJ3WQZAR8wuvhufbbOpzsIMiwVYiqfUXYgB0cJxYrTz9oI96yzMsAjg901tdm4ms7uY7fxIwcF1FaJ2ARTxIE6uuxw1keN0vKcuS1C7APA7eGLdhaiZ0/DKoob2GAYBnCyWfHdkcrFQdWQdN66NgkWi/2+IoeJpg75p3RbgSXh8zWUYJk4sxl/+7jm1CaCIH8/Rm+XZ2cJSHDLIG9ZpAfbF79V4/2FkkVi6Hhh1CuBYHF7j/YeRlgh/Gxi1CKAa7pwiQr8aHsnRxQC7xboswAE4oaZ7DzuPE1FMA6EuATxdhHk3PJq9RQzjQBi4AIro5/4AcwZ97xnCPBwzqJvVYQEOxjNquO9M4phiQC/IwAWQovEPHvR9ZxhLDWhxaNAC2OkeTsmiG2jYNvuLvYt9Z9ACWPpjTqh7/nkGsABHDeJGg26LF3x/xwv8mCrLigGE7A1SAPvgtM/SWkXZWIHtcpSwBH1lkO3wLBz5I1xBSkMUGj2kHGIAIfJ9E0ARVysx970sbHEm5pb4CPmXSI0nOC6LxGigr4xM58PVpM4uVWH3FmZ+3+rfi7BgLbsfwx4Lok8Dq8neQtqPzpG0hm67zHAwIuIlrur3TSZMtX1rsVDmMWLp8nDR8G0hhpYtnJcMN9FZM2bo92Py19P5IOUh5I0ItsoTC3Zu89t+3WC7Aqg80X3wTDGF+zQcJHbybtdL7ZC+beub4r5B67WUF9J5XGMJtsbhwpr+sl832KYAqoY/FC/CGThCpG2ZFBsofxntv9Uu/0vkr6TzD3Se0IhgLHvjMH0UwFadwCLM+WtF9ou3itDtSTd+hvXk927H0txA6+VkX6GTk4Ziv9pwsLM+Lww9SgBFBGlehncJ9U2rPVJc2/2On5D/OfnH6GwmNfMED3FMMU1nfTwe8Zyr9CxX4Hl6cNOEXSkXTzB/zkqy82i9jc5qymaYCJZmYZH7wkMCKKKPfz+O7uUN5tE6YhLzDevIPsTIy0jLKbOmSzhwtI8LQzkUkYDxLWLc2fMbPAvzJzHzV+IrtM4l+yDl/TvwpFFi4co++gHdN/MUvKAfNyjxFLKjp5AnZyXZ+bReRvo6nbQD+gYJP+LJ+rQwlFdv/zliXN+XCrTJ/xhzpzD/vxlfJH8p+fmUK2KkMByZLQbEbeGYL+zHd+eizz+2nxUocSrZidPIlvUbsvfT+iOySxktKidxtgshw68igurAfnx/LrJVLOpnJRIWkL8OB0xDBAk3kb+RkRfjSjprZ7EQMjxIeevDCbN7Tl59cd+71g6Wkb+BtMs0l4JHsZz81eTnkP6dzn2VEGaTj5BjBelmdsp5Sj/Wz0cMcBMCsrPJV9C5mNboNF/cjTF72FpOOoZ0FqMnke9HnhvCpHyTJJGuwWoczxl3s/o+rk49TD6ZFZHn9sRBVSrDOsq3kC6j1csUmiOkw0inkp6LpeTzyUpDnKpzG7TwQzovJrud/ImUnyS1WZEi5+C/iSTV0zIMWcF1BpykIce9pDeH+c6mawkeVSksIj2d8lQcT7Yv2QhZx/CHIrWwkvQq0heqXm0R5X9THsVI+XB29I/gijb3TPlZFXwcZw+6kjnWUL6D8jJam/rkx80hHUx6JunZWEa2mGxOZRmqtYqhIKuey2103kR2LXm3bCOkSylPj66zyyhuwAW4rh2j5kkxIs7HSQbsSJfYnfytaFN+gHxdH8qwmezncflYJYbj6DwDR5PvT7Yz8hoF0W349aTrKC8i++EYf3aU7NaYDNtyUnRExGkchX8puKjNykndu4gkTVcaQATqtio/Srqazjto3TkgIY6QFpOOIC2Ly2Fk+5DtUnUXXSF0hdHLOncbvUMqSDeQPoEvk6/fxjM4i/LDD398LCW+ir8V5xZMqMhZEUEH16gxU2dVo7ScdL4Y4g36LZxLWkQ6KERRHka+hM4+zFlMZ1dac8Url1cNMJkyVi2WNuNB0j2kW0jfJPsa2c1kG7Yj/pPZeDkjrfF3Vq3A3+HKiXQJGRS8XSinVlq4k/J9pI+TP1Dj/E4mRLEr9qKzJ639GN2Xcg/mtkMwm3bDPEZGtrJ8nkgb2PQA6W7m3kW6g/IXtG4nrSbfOIk6VgJotba/VL8G78TFbR7cXj0VsdjwGWENaiXHJtK1lO8h+1EN1mAiZKSRapWyRZZtoyE7lB3hi0wkMGY8TqdzCXk2se/ZIE5He+d4Iug6Gj8Q3UDtlJhDdhqtK/AKOsOUX79LIttMvqHqs9eJM2PGXg+SbwoRT9uaLQnBTfR75okU9W8sxlnoy6HqK/5JHIBUO0nM4h0YK4D5RylPpjNvCIUwKOaTnhyWZjJ0RfCKYht+w5ZDje/hEkM0aVZGAbNn0rokVgPLYynn7IBCODpGKtkUGmc+/kYkpX4UjxBUEZs+PmEI8/d1h02rKT9LupzsB2GGZ+NC4CPYifQ+OmczMo31jVtwVju6+4d41MMrIoPHx/Rp/Xm6dIVwD+XnSFfiu9EXz1ohnEnnvTE/MV2H+JM4t83a7i8e1S+cFwccrRdWYNJ7AQZBwi4RZpafIsxjJ4ZV2YOzTAjH03kX9o6NttPlUKy4ILp7bONhVefsvhl/rY8x6b2gaxEeJP0kugfXkf2MrF/rC4PiGTEtnA7v7arp/+H5be5gnAdUneTxHvyJGRJn0UJZzbJ9O7oIN5DfMcN8hXmkMyjfSP6YqTl+41Hi9W3+ke08lCLSuXzADDvKNRNi2ERaSbqR8nrcGMEo251yrYsqPKv8C9ILyHfufeN3uRHPbbN6uw+iYD9cLIYRQ/ngxiOvrs2VZfgJ6Vuk75DdQvabIegqdiI9nnQm5WmxQpn3egFqDBvEiODTE6p4EWFjF+DFZnCKt66/gLQOqyh/TvphTDmn28jvxto+BKmMZT7pQNKxpJPwNLK9Ki9/QBMxF7d5zYQrWe0YPh8vN6Sjg8mw5ZJswgbSWsqV+HVE4uYrSHdiFa01dNbHtG++mbRFmNm2nmGquqJsPmlB7JHMH8fo0hjBOIK8G5xSQ6TSDXjepFRepTF/LV5vZp/wvVW6gshEY5SkjWIlZT2j95HfR2s9m9cxug5rmLuBVjbmexawaQGdPZizkNbejC5kZFex1kHv4wwmyZ04edJmrsph+yL8vdl50PMjyLb4ubVIjDSBz6Yx15CwBmdNenhXLRx9FC/B8rpr0W+6jVaKBarRMVdnnGvLv6n5bd8ac7HblMb37QhP/qoIJr0MG+uuTcOUyKY1wdPmV3ilOAP3jrpr0zApkmqj7bRox7rBh8Rk0bUmmA2koXY2oOjJFG/VJSwXfsGbTDI0uaEW1uGuns7xtyND7IUirdynNL7BMHMnVvd8kadNWVmDl+JV+Kmhc4Ab8GO96gK2RjvGmZfg+bjINPavNfScUrV5ZCCLIFWeu6fi1SIf0a51P4EdnBU4uc3NA1nnbzPa5hs4VziKnxdeaEM9fFHsLq5nGbSIfYin4mUiOeVOdT+RHYj7cEab66l5HbxgDzxXCOE4jRAGweX403Y1QhuKAI9KCM8RI4enG+DhyTsYd4i3/8buL4ZCAF2qOMRnCT/h2fqcvWwHYyPOE4EgDw3Lh0oAXYqHz899oUhcfYgZEpg6xFyKv2rHDOBDDKUAuhTR6I8VfsIZWKbpHqbCNfizNqvG/sdQC6BLddjUQuEo/qHIanaQGRyfOCCS2Pb/mvY2Th2ZEQLYkmpS6SD8rugejhPh6zOuLn1mkzj74U1be/O7zOiHVu17XyIcxueIvMftmV6vHnCX2Pjx4TYPjPeHs+ZBVVnPj8AJoos4WmQ82ZGcx034kkgP8/WJZBOdNQLYksoyHCq6hxNECpyDxCFMs5FRse37n3FVm/sn+sFZKYAtqXyGvXEkjheLUkvFCaczfebxt/iuSPb5Kaya7OFCs14AY6msw75CEMuqa0n1u91nwDPZJGIxv4xP45vtmN+fEsNe2b5TRHj0nmKyaYnIurlEHNKwWIhiTo1FHMW9+AW+ha/hO7iz3YOE6Du8AMZSzTnME/MO+4vNLweLCakDhKXYSzid86u/nWPqz7K79WCDMOkPCC/+dpHG96fVzzuwttcZ0xoBTILKWuxWXXtVV7v6uacQzQIhjvFmLLtZ5O4Xb/c9uLu67hImfU27ibBuaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaJga/w+0J7/HFrMQVgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wNi0yN1QxMTozMzozNi0wNDowMOYj3cwAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDYtMjdUMTE6MzM6MzYtMDQ6MDCXfmVwAAAAAElFTkSuQmCC";

const filterCriteriaCacheKey = "filterCriteria";
const backupFilterCriteriaCacheKey = "filterCriteriaBackup";

/**
 * Retrieve a Google Sheets bearer token.
 * @returns {Promise<string>} Google Sheets bearer token.
 */
function getToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (!token) {
        reject(new Error("Failed to retrieve new token"));
        return;
      }
      resolve(token);
    });
  });
}

/**
 * Promise wrapper for getting extension options.
 */
function getOptions() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      [
        "sheetId",
        "nameRange",
        "locationRange",
        "tierRange",
        "lastRead",
        "cacheTimeout",
        "backupSheet",
        "backupCountryRange",
        "backupAccountRange",
        "backupVariationRange",
      ],
      (opts) => resolve(opts)
    );
  });
}

/**
 * Promise wrapper for setting extension options.
 * @param {Object} opts The options to set.
 */
function setOptions(opts) {
  return new Promise((resolve) => chrome.storage.sync.set(opts, resolve));
}

/**
 * @returns {FilterCriteria[]}
 */
function getLocalCache(key) {
  return new Promise((resolve) => chrome.storage.local.get([key], resolve));
}

function setLocalCache(opts) {
  return new Promise((resolve) => chrome.storage.local.set(opts, resolve));
}

/**
 * Get the filter criteria, trying from an in-memory cache first.
 * @param {Object} opts
 * @returns {FilterCriteria[]}
 */
async function getCriteria(opts, key) {
  const now = Date.now();
  const fiveMinutes = 60 * 1000 * (opts.cacheTimeout || 5);

  const localCache = await getLocalCache(key);
  const cachedCriteria = localCache[key];
  if (cachedCriteria && opts.lastRead && now - opts.lastRead <= fiveMinutes) {
    return cachedCriteria;
  }
  const filterReadOptions = getFilterReadOptions(opts, key);

  const sheets = new GoogleSheets(getToken);
  const criteriaClient = new FilterCriteriaClient(sheets, filterReadOptions);

  if (key === backupFilterCriteriaCacheKey) {
    const filterCriteriaBackup = await criteriaClient.getFilterCriteria();
    await setOptions({ lastRead: Date.now() });
    await setLocalCache({ filterCriteriaBackup });
    return filterCriteriaBackup
  }

  const filterCriteria = await criteriaClient.getFilterCriteria();
  await setOptions({ lastRead: Date.now() });
  await setLocalCache({ filterCriteria });
  return filterCriteria;
}

const getFilterReadOptions = (opts, key) => {
  if (key === backupFilterCriteriaCacheKey) {
    return [
      new FilterCriteriaReadOptions(
        opts.backupSheet,
        opts.backupAccountRange,
        opts.backupCountryRange,
        opts.backupVariationRange
      ),
    ];
  }

  return [
    new FilterCriteriaReadOptions(
      opts.sheetId,
      opts.nameRange,
      opts.locationRange,
      opts.tierRange
    ),
  ];
};

async function handleSearch(body) {
  if (body.company.length < 1) {
    return [];
  }

  const isoLocation = isoCountryMap[body.location.toUpperCase()]
    ? body.location
    : countryIsoMap[body.location.toLowerCase()];
  if (!isoLocation) {
    return [];
  }

  const options = await getOptions();
  const criteria = await getCriteria(options, filterCriteriaCacheKey);

  // Main match from main spreadsheet
  let matches = criteria.filter(
    (c) =>
      body.company.find(
        (comp) => comp.toLowerCase() === c.name.toLowerCase()
      ) ||
      c.altNames.find((alt) =>
        body.company.find((comp) => new RegExp(alt).test(comp.toLowerCase()))
      )
  );

  // If there are no matches - try match against backup sheet
  if (isBackupSheetConfigured) {
    const criteriaBackup = await getCriteria(
      options,
      backupFilterCriteriaCacheKey
    );
    if (matches.length === 0) {
      console.log("No matches found using regular - trying match from backup");
      criteriaBackup.forEach((backup) => {
        backup.backupName = backup.tier;
        const mainSheetCompany = criteria.find(
          (it) => it.name === backup.name && it.location === backup.location
        );
        backup.tier = mainSheetCompany ? mainSheetCompany.tier : "Unknown";
      });
      matches = criteriaBackup.filter((c) =>
        body.company.find(
          (comp) => comp.toLowerCase() === c.backupName.trim().toLowerCase()
        )
      );
    }
  }

  // if (matches.length === 0) {
  //   console.log("No matches found - trying fuzzy search");
  //   const companies = Array.from(body.company).reduce(
  //     (acc, company) => {
  //       const fuse = new Fuse(criteria, fuseOptions);
  //       const fuseSearchResult = fuse.search(company).map((c) => {
  //         return c.item
  //       })

  //       acc = acc.concat(fuseSearchResult)
  //       return acc;
  //     },
  //     []
  //   );
  //   // const fuse = new Fuse(criteria, fuseOptions);
  //   // const fuseSearchResult = fuse.search(body.company[0]).map((c) => {
  //   //   return c.item
  //   // })
  //   console.log("fuse result", body.company, companies);
  //   matches = companies
  // }

  matches = matches.map((c) => {
    const criteriaIsoLocation = isoCountryMap[c.location.toUpperCase()]
      ? c.location
      : countryIsoMap[c.location.toLowerCase()];
    return {
      name: c.name,
      fullLocation: isoCountryMap[criteriaIsoLocation],
      isoLocation: criteriaIsoLocation,
      locationMatch: c.location.toLowerCase() === isoLocation.toLowerCase(),
      tier: c.tier,
    };
  });
  return { matches };
}

async function handleClearCache() {
  await setLocalCache({ filterCriteria: null });
}

async function handleRestoreDefaults() {
  await setOptions(config);
  return { options: config };
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await getToken();
    chrome.notifications.create(null, {
      type: "basic",
      iconUrl: iconDataUri,
      title: "Google Sheets linked successfully",
      message: "Successfully retrieved a Google Sheets token",
    });
    await setOptions(config);
  } catch (err) {
    chrome.notifications.create(null, {
      type: "basic",
      iconUrl: iconDataUri,
      title: "Failed to link to Google Sheets",
      message:
        "Go to https://myaccount.google.com/permissions, remove this extension and try again",
    });
  }
  console.info("Setup complete");
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (!request.action) {
    throw new Error("No action was provided");
  }
  if (request.action === "search") {
    handleSearch(request.body).then((result) => {
      if (!result) {
        throw new Error("Results are undefined");
      }
      sendResponse(result);
    });
  }
  if (request.action === "clear-cache") {
    handleClearCache().then(sendResponse);
  }
  if (request.action === "restore-defaults") {
    handleRestoreDefaults().then(sendResponse);
  }
  return true;
});

const isBackupSheetConfigured = () => {
  return (
    config.backupAccountRange &&
    config.backupCountryRange &&
    config.backupSheet &&
    config.backupVariationRange
  );
};
