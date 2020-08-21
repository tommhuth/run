export default {
    Z_START: -30,
    Z_INIT: -200,
    Y_INIT: 100,
    Y_START: 6,
    BLOCK_WIDTH: 28,
    BLOCK_HEIGHT: 100,
    BLOCK_MAX_EXTRA_WIDTH: 5,
    BLOCK_IN_DURATION: 750,
    BLOCK_OUT_DURATION: 600,
    BLOCK_IN_EASING: "easeOutQuart",
    BLOCK_OUT_EASING: "easeInCubic",
    DISTANCE_INCREMENT: 200,
    IS_SMALL_SCREEN: window.matchMedia("(max-width: 650px)").matches,
    IS_LARGE_SCREEN: window.matchMedia("(min-width: 950px)").matches,
    DO_FULL_POST_PROCESSING: window.matchMedia("(max-width: 850px)").matches,
    BUILD_TIME: process.env.BUILD_TIME,
    REGISTER_SERVICEWORKER: process.env.REGISTER_SERVICEWORKER === "true"
}