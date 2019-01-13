importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js")

if (workbox) {
    console.log("Yay! Workbox is loaded ")
} else {
    console.log("Boo! Workbox didnt load ")
}

workbox.precaching.precacheAndRoute(self.__precacheManifest || [])
