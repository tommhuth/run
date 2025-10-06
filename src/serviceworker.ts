import { CacheableResponsePlugin } from "workbox-cacheable-response"
import { clientsClaim,skipWaiting } from "workbox-core"
import { ExpirationPlugin } from "workbox-expiration"
import { createHandlerBoundToURL,precacheAndRoute } from "workbox-precaching"
import { NavigationRoute,registerRoute } from "workbox-routing"
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies"

skipWaiting()
clientsClaim()

 
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST)

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
    ({ url }) => url.origin === "https://fonts.googleapis.com",
    new StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
    })
)

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
    ({ url }) => url.origin === "https://fonts.gstatic.com",
    new CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
            }),
        ],
    })
)

// return a specific response for all navigation requests
// https://developers.google.com/web/tools/workbox/modules/workbox-routing
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")))
