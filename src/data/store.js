import create from "zustand"
import GameState from "./const/GameState"
import getRandomBlock from "./getRandomBlock"
import getInitState from "./getInitState"

const [useStore, api] = create((set, get) => {
    return {
        data: {
            ...getInitState()
        },
        actions: {
            start() {
                set({
                    data: {
                        ...get().data,
                        state: GameState.RUNNING
                    }
                })
            },
            setBaseY(y) {
                set({
                    data: {
                        ...get().data,
                        baseY: y
                    }
                })
            },
            reset() {
                let { hasDeviceOrientation, mustRequestOrientationAccess } = get().data

                set({
                    data: {
                        ...getInitState(),
                        state: GameState.RUNNING,
                        attempts: get().data.attempts + 1,
                        hasDeviceOrientation,
                        mustRequestOrientationAccess
                    }
                }) 
                get().actions.generatePath()
            },
            end() {
                set({
                    data: {
                        ...get().data,
                        state: GameState.GAME_OVER
                    }
                })
            },
            async requestDeviceOrientation() {
                try {
                    let access = await DeviceOrientationEvent.requestPermission()

                    if (access === "granted") {
                        set({
                            data: {
                                ...get().data,
                                hasDeviceOrientation: true,
                                mustRequestOrientationAccess: false,
                                state: GameState.READY
                            }
                        })
                    } else {
                        set({
                            data: {
                                ...get().data,
                                state: GameState.REQUEST_ORIENTATION_ACCESS_FAIL
                            }
                        })
                    }
                } catch (e) {
                    //console.log("requestDeviceOrientation fail", e)
                }
            },
            hasDeviceOrientation() {
                set({
                    data: {
                        ...get().data,
                        state: GameState.READY,
                        hasDeviceOrientation: true
                    }
                })
            },
            generatePath() {
                let { blocks, position } = get().data
                let { addBlock } = get().actions
                let previous = blocks[blocks.length - 1]
                let buffer = 30

                while (previous.end - position.z < buffer) {
                    previous = addBlock()
                    position = get().data.position 
                }
            },
            addBlock() {
                let { blocks, position, ...rest } = get().data
                let previous = blocks[blocks.length - 1]
                let next = getRandomBlock(previous)
                let buffer = 5 // backwards cutoff distance from ball
                let futureBlocks = blocks.filter(i => i.start + i.depth > position.z - buffer)

                set({
                    data: {
                        ...rest,
                        position,
                        blocks: [...futureBlocks, next]
                    }
                })

                return next
            },
            setPosition(x, y, z) {
                set({
                    data: {
                        ...get().data,
                        position: { x, y, z }
                    }
                })
            }
        }
    }
})

window.api = api

export { useStore, api }