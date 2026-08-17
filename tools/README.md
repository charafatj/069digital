# tools/

Development tooling for the 069Digital site. Neither script is part of the
deployed site; both are run manually from the repo root.

## build-sitemap.mjs

Generates `sitemap.xml` from the HTML files that actually exist on disk.

```sh
node tools/build-sitemap.mjs          # rewrite sitemap.xml
node tools/build-sitemap.mjs --check  # exit 1 if out of date (for CI)
```

The previous hand-maintained sitemap advertised six blog posts when only one
existed, so five URLs served 404 to crawlers. Generating the file from the
filesystem makes that impossible. Pages carrying `<meta name="robots" ...
noindex>` and anything in the script's `EXCLUDE` set are omitted.

## verify-site.js

Loads every page in a headless Chromium at desktop (1440x900) and mobile
(390x844 @3x) and reports, per page and viewport: JavaScript errors, console
errors, failed requests, transferred weight, request count, LCP, CLS, document
height, horizontal overflow (with the offending elements), tap targets under
44px, and a full-page screenshot. It also resolves every internal link against
the filesystem, relative to the page containing it.

```sh
node tools/verify-site.js . /tmp/verify-out BEFORE
```

Requires the globally installed `playwright` and `http-server` packages present
in this container. Google Fonts is stubbed with an empty stylesheet, because it
is unreachable in the sandbox and its timeout otherwise dominates LCP — so
screenshots render in fallback fonts and font-swap CLS is not measured.
