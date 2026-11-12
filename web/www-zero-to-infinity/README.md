# World Wide Web: Zero to Infinity (with Champuter)

This directory contains a complete provider-neutral illustrated WWW course, Blogger-ready HTML, an interactive Web Storage and HTTP practice playground, a harmless example JSON API response, an SVG drawing of the existing Champuter teacher, and a local Node.js Express session demonstration.

## Links
- [Complete course preview](https://dsa.learnwithchampak.live/web/www-zero-to-infinity/)
- [Interactive WWW practice playground](https://dsa.learnwithchampak.live/web/www-zero-to-infinity/playground.html)
- [Blogger-ready post HTML](./blogger-post.html)

## Publishing on Blogger
In Blogger, choose **New Post → HTML view** and copy the entire content of `blogger-post.html`.
The existing Learn With Champak site-wide Champuter teacher integrates with standard `.post-body` articles. The standalone GitHub Pages preview loads the teacher assets itself. Do not insert duplicate Champuter scripts in a theme that already includes them.

## Local server-session example
1. Copy `server-demo.js` to a local Node.js project (or download this directory).
2. Run `npm init -y` and `npm install express express-session`.
3. Run `node server-demo.js`.
4. Visit `http://localhost:3000/`, then inspect Application → Cookies and try `/protected`.

**Never deploy this example unchanged**: it performs no real user authentication, uses a volatile MemoryStore and a local HTTP-only cookie setting. Production systems require HTTPS, `Secure` cookies, authentication, production-grade session storage, CSRF protections, a strong configured secret, rate limiting, and app-specific authorization rules. The app binds only to local loopback by default.

## Validation scope
Verified that the directory files exist in GitHub and article table-of-contents links point to headings. Browser-based, live-site activation tests are not claimed.
