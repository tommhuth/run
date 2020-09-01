export default {
    REGISTER_SERVICEWORKER: process.env.REGISTER_SERVICEWORKER === "true",
    DEBUG_MODE: new URLSearchParams(location.search.substring(1)).has("debug"),
    IS_SMALL_SCREEN: window.matchMedia("(max-width: 700px)").matches
}