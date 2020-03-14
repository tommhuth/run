import getBlock from "./getBlock"
import GameState from "./const/GameState"
import getInitState from "./getInitState"

let tid

export default function getActions(get, set, actions) {
    return {
        extendTime() {
            let { time } = get()

            set({ time: time + 1000 })
        },
        timer() {
            let { end } = actions()

            tid = setInterval(() => {
                let { time } = get()

                if (time - 100 < 0) {
                    end("timeout")
                } else {
                    set({ time: time - 100 })
                }
            }, 100)
        },
        start() {
            let { timer } = actions()

            set({ state: GameState.RUNNING })
            timer()
        },
        reset() {
            let { timer } = actions()
            let {
                hasDeviceOrientation,
                mustRequestOrientationAccess,
                attempts
            } = get()

            set({
                ...getInitState(),
                state: GameState.RUNNING,
                attempts: attempts + 1,
                hasDeviceOrientation,
                mustRequestOrientationAccess
            })
            timer()
        },
        end(reason) {
            set({ state: GameState.GAME_OVER, reason })
            clearInterval(tid)
        },
        async requestDeviceOrientation() {
            try {
                let access = await DeviceOrientationEvent.requestPermission()

                if (access === "granted") {
                    set({
                        hasDeviceOrientation: true,
                        mustRequestOrientationAccess: false,
                        state: GameState.READY
                    })
                } else {
                    set({ state: GameState.REQUEST_ORIENTATION_ACCESS_FAIL })
                }
            } catch (e) {
                set({ state: GameState.REQUEST_ORIENTATION_ACCESS_FAIL })
            }
        },
        hasDeviceOrientation() {
            set({
                state: GameState.READY,
                hasDeviceOrientation: true
            })
        },
        generatePath() {
            let { blocks, position } = get()
            let { addBlock, clearBlocks } = actions()
            let previous = blocks[blocks.length - 1]
            let forwardBuffer = 35

            while (previous.end - position.z < forwardBuffer) {
                previous = addBlock()
            }

            clearBlocks()
        },
        clearBlocks() {
            let { blocks, position } = get()
            let backwardBuffer = 25 // backwards cutoff distance from ball
            let cleanedBlocks = blocks.filter(i => i.end > position.z - backwardBuffer)

            if (cleanedBlocks.length !== blocks.length) {
                set({ blocks: cleanedBlocks })
            }
        },
        addBlock() {
            let { blocks } = get()
            let next = getBlock(blocks[blocks.length - 1])

            set({ blocks: [...blocks, next] })

            return next
        },
        setPosition(x, y, z) {
            set({ position: { x, y, z } })
        }
    }
}