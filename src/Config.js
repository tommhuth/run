export default {
    Z_START: 0,
    BLOCK_WIDTH: 28,
    BLOCK_HEIGHT: 100,
    BLOCK_MAX_EXTRA_WIDTH: 5,
    IS_SMALL_SCREEN: window.matchMedia("(max-width: 650px)").matches,
    IS_LARGE_SCREEN: window.matchMedia("(min-width: 950px)").matches,
    BUILD_TIME: process.env.BUILD_TIME
}