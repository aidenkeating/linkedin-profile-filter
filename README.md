# LinkedIn Profile Filter

A small extension for Chrome to show notifications on a LinkedIn or LinkedIn
Recruiter page if the viewed profile matches a specified set of criteria.

## Prerequisite
* [rollup.js](https://rollupjs.org/guide/en/)
    * Required for building plugin

## Getting started

Copy `config.template.json` to `config.json`:

```
cp config.template.json config.json
```

Update the contents of `config.json`, where:

- `sheetId` is the ID of the Google Sheet.
- `nameRange` is the Google Sheet a1 range of company names.
- `locationRange` is the Google Sheet a1 range of company locations.
- `tierRange` is the Google Sheet a1 range of the company tiers.
- `cacheTimeout` is the amount of time to wait before performing another network call to Google Sheets instead of using the local cache.

Copy `manifest.template.json` to `manifest.json`:

```
cp manifest.template.json manifest.json
```

Update the contents of `manifest.json`, where:

- `client_id` is a Google OAuth application (from Google Cloud Platform).
- `key` is the extension key from the Google Extension dashboard.

Build the project:

```
yarn build
```

Import the project in chrome.

The first time the extension is installed you will be asked for Google Sheets
permissions. These are read-only permissions and allow the extension to read
the specified Google Sheet when it needs to.

## Publishing as an extension

Request access to the extension Google Group. This will give you publishing
permissions.

Ensure a version bump of `manifest.json` and `package.json` have been done.
The Chrome dashboard will reject attempted updates whose version conflicts with
a previous release of the extension.

Run `yarn build:prod`.

Upload the resulting `zip` file through the Chrome Extension dashboard. This
will take about 30 minutes to become available to new testers.