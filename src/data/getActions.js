import getBlock from "./getBlock"
import GameState from "./const/GameState"
import getInitState from "./getInitState"
import LocalStorage from "./LocalStorage"

let tid

export default function getActions(get, set, actions) {
    return {
        traumatize(amount = .2) {
            set({ trauma: [...get().trauma, amount] })
        },
        extendTime(amount = 2000) {
            let { time } = get()

            set({ time: time + amount })
        },
        reduceTime(cost = 3000) {
            let { time } = get()

            if (time - cost >= 0) {
                set({ time: time - cost })

                return true
            }

            return false
        },
        startTimer() {
            let { end } = actions()
            let decrement = 1000

            tid = setInterval(() => {
                let { time } = get()

                if (time - decrement < 0) {
                    end("Timeout")
                } else {
                    set({ time: time - decrement })
                }
            }, decrement)
        },
        stopTimer() {
            clearInterval(tid)
        },
        start() {
            let { startTimer } = actions()

            set({ state: GameState.RUNNING })
            startTimer()
        },
        reset() {
            let { startTimer } = actions()
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
            startTimer()
        },
        end(reason) {
            let { stopTimer } = actions()
            let { personalBest, position } = get()
            let score = Math.floor(position.z) - 40
            let hasNewPersonalBest = false

            if (personalBest < score) {
                if (personalBest > 0) {
                    hasNewPersonalBest = true
                }

                personalBest = score
                LocalStorage.set("run-best", score)
            }

            set({ state: GameState.GAME_OVER, reason, score, personalBest, hasNewPersonalBest })
            stopTimer()
        },
        ready() {
            set({ state: GameState.READY })
        },
        async requestDeviceOrientation() {
            try {
                let access = await DeviceOrientationEvent.requestPermission()

                if (access === "granted") {
                    set({
                        hasDeviceOrientation: true,
                        mustRequestOrientationAccess: false,
                        state: GameState.RUNNING
                    })
                } else {
                    set({ state: GameState.REQUEST_ORIENTATION_ACCESS_FAIL })
                }
            } catch (e) {
                set({ state: GameState.REQUEST_ORIENTATION_ACCESS_FAIL })
            }
        },
        hasDeviceOrientation() {
            set({ hasDeviceOrientation: true })
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