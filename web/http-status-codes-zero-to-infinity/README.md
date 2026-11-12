# HTTP Status Codes: Zero to Infinity — with Champuter

A complete provider-neutral Blogger-ready lesson about HTTP 1xx–5xx response statuses and practical debugging with Chrome Developer Tools.

## Files
- `index.html`: standalone illustrated lesson preview, loading the existing Champuter teaching controller
- `blogger-post.html`: full Blogger-ready post body (HTML view)
- `playground.html`: interactive Chrome Network panel practice page
- `status-server.js`: localhost-only Express server giving actual HTTP responses for guided experiments
- `sample-ok.json`: known 200 OK static resource
- `champuter-status-codes.svg`: original lesson illustration using the established Champuter figure

## Launch
- [Read illustrated course](https://dsa.learnwithchampak.live/web/http-status-codes-zero-to-infinity/)
- [Open practical playground](https://dsa.learnwithchampak.live/web/http-status-codes-zero-to-infinity/playground.html)
- [Blogger HTML source](./blogger-post.html)

The public static playground can show **real HTTP 200 and 404**. For 201, 202, 204, 206, 301/302/303/307/308, 304, 400, 401, 403, 405, 409, 410, 412, 415, 422, 429 and 500/502/503/504, run the local API server.

### Local lab
1. Download the three files `status-server.js`, `playground.html`, `sample-ok.json` into one folder, or clone this repo.
2. Open a terminal in that folder and run `npm install express` (or `npm install` if using the bundled package.json).
3. Run `node status-server.js` (or `npm start`).
4. Open http://127.0.0.1:3000 in desktop Chrome.
5. Press F12 → Network → Fetch/XHR and enable Preserve log when studying redirects.
6. Observe request status, headers, response body, timing and initiator.

For a deterministic 304:
```bash
curl -i http://127.0.0.1:3000/api/cache-demo
curl -i -H 'If-None-Match: "champuter-lesson-v1"' http://127.0.0.1:3000/api/cache-demo
```

**Important:** The HTTP status responses from the local server are real, but the example incident descriptions are simulations, not actual production outages or real rate limits. Server binds only to localhost and is intended exclusively for education.

## Blogger metadata
**Title:** HTTP Status Codes Explained from Zero to Infinity | Chrome DevTools & Champuter

**Labels:** HTTP, Status Codes, Chrome Developer Tools, Network, 200 OK, 404 Not Found, 500 Internal Server Error, JavaScript, Node.js, Express, API, Debugging, Web Development, Champuter, Zero to Infinity

**Search description:** Learn HTTP status codes 1xx–5xx with Champuter and Chrome DevTools. Inspect 200, 301, 304, 401, 403, 404, 429 and 500 responses in practical Network and Node.js labs.

## Publishing
Blogger → New Post → HTML view: paste the complete contents of `blogger-post.html`. The existing Learn With Champak site-wide Champuter integration can teach this article. Do not duplicate Champuter's phase1 stylesheet or script inside a blog theme that already loads them.

## Verification
Source files and internal section links were checked after upload. Browser-based tests of live GitHub Pages and all Node endpoints require a browser and a local Express installation; do not represent them as executed if they were not.
