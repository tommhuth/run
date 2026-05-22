export default {
    DEBUG: window.location.search.toLowerCase().includes("debug"),
    STATS: window.location.search.toLowerCase().includes("stats"),
}
