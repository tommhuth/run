import create from "zustand"
import GameState from "./const/GameState"
import random from "./random"
import getInitState from "./getInitState"
import uuid from "uuid"
import BlockType from "./const/BlockType"

const [useStore, api] = create((set, get) => {
    return {
        data: getInitState(),
        actions: {
            start() {
                set({
                    data: {
                        ...get().data,
                        state: GameState.RUNNING
                    }
                })
            },
            reset() {
                let {
                    hasDeviceOrientation,
                    mustRequestOrientationAccess,
                    attempts
                } = get().data

                set({
                    data: {
                        ...getInitState(),
                        state: GameState.RUNNING,
                        attempts: attempts + 1,
                        hasDeviceOrientation,
                        mustRequestOrientationAccess
                    }
                })
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
                let { addBlock, clearBlocks } = get().actions
                let previous = blocks[blocks.length - 1]
                let forwardBuffer = 35

                while (previous.end - position.z < forwardBuffer) {
                    previous = addBlock()
                    position = get().data.position
                }

                clearBlocks()
            },
            clearBlocks() {
                let { blocks, position, ...rest } = get().data
                let backwardBuffer = 25 // backwards cutoff distance from ball
                let futureBlocks = blocks.filter(i => i.end > position.z - backwardBuffer)

                set({
                    data: {
                        ...rest,
                        position,
                        blocks: [...futureBlocks]
                    }
                })
            },
            addBlock() {
                let { blocks, position, ...rest } = get().data
                let previous = blocks[blocks.length - 1]
                let depth = random.integer(10, 25)
                let next = {
                    start: previous.end,
                    end: previous.end + depth,
                    type: BlockType.OBSTACLES,
                    depth,
                    id: uuid.v4(),
                    y: random.pick([previous.y, previous.y + 2])
                }

                set({
                    data: {
                        ...rest,
                        position,
                        blocks: [...blocks, next]
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