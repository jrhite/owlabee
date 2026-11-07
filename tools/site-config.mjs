// The one place the site's base URL lives. Change it (for example to a custom domain),
// then run `node tools/build-site.mjs` and `node tools/build-examples.mjs` and commit the output.
// Must end with a slash.
export const BASE_URL = 'https://owlabee.com/';

export const SITE_NAME = 'owlabee';
export const REPO_URL = 'https://github.com/owlabee/owlabee';
export const STORE_PROFILE_URL = 'https://apify.com/owlabee';

// IndexNow key (public by design: it is served at /<key>.txt to prove we own the site).
// .github/workflows/indexnow.yml pings Bing and other IndexNow engines when docs/ changes on main.
export const INDEXNOW_KEY = '43ff82450b6ce8d2224c3d9f204e27b8';
