export default {
    Z_START: 0,
    Z_INIT: -200,
    BLOCK_WIDTH: 28,
    BLOCK_HEIGHT: 100,
    BLOCK_MAX_EXTRA_WIDTH: 5,
    BLOCK_IN_DURATION: 750,
    BLOCK_OUT_DURATION: 600,
    BLOCK_IN_EASING: "easeOutQuart",
    BLOCK_OUT_EASING: "easeInCubic",
    IS_SMALL_SCREEN: window.matchMedia("(max-width: 650px)").matches,
    IS_LARGE_SCREEN: window.matchMedia("(min-width: 950px)").matches,
    DO_POST_PROCESSING: window.matchMedia("(max-width: 850px)").matches,
    BUILD_TIME: process.env.BUILD_TIME,
    REGISTER_SERVICEWORKER: process.env.REGISTER_SERVICEWORKER === "true"
}