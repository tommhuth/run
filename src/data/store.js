import create from "zustand"
import uuid from "uuid"
import Config from "../Config"
import random from "../data/random"
import GameState from "../data/const/GameState"
import BlockType from "./const/BlockType"

const mustRequestOrientationAccess = window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission
const initState = {
    hasDeviceOrientation: !mustRequestOrientationAccess,
    mustRequestOrientationAccess,
    state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.READY,
    blocks: [
        {
            start: Config.Z_START,
            end: Config.Z_START + 50,
            depth: 50,
            id: uuid.v4(),
            width: Config.BLOCK_WIDTH,
            type: BlockType.START,
            y: 0
        },
    ],
    enemies: [],
    attempts: 0,
    position: { x: 0, y: 20, z: Config.Z_START },
    gameOverReason: null,
    distance: 0,
    nextDistanceThreshold: Config.DISTANCE_INCREMENT,
    score: 0,
}

const [useStore, api] = create((set, get) => {
    return {
        ...initState,
        // 
        start() {
            set({ state: GameState.RUNNING })
        },
        end(reason) {
            set({ state: GameState.GAME_OVER, gameOverReason: reason })
        },
        reset() {
            let {
                hasDeviceOrientation,
                mustRequestOrientationAccess,
                attempts
            } = get()
            let data = {
                ...initState,
                state: GameState.RUNNING,
                attempts: attempts + 1,
                hasDeviceOrientation,
                mustRequestOrientationAccess
            }

            data.blocks[0].id = uuid.v4()

            set(data)
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
                    throw new Error("User denied access")
                }
            } catch (e) {
                set({ state: GameState.REQUEST_ORIENTATION_ACCESS_FAIL })
            }
        },
        deviceOrientationGranted() {
            set({ hasDeviceOrientation: true })
        },
        setPosition(x, y, z) {
            set({ position: { x, y, z } })
        },
        addScore(incr = 1) {
            let { score } = get()

            set({ score: score + incr })
        },
        addEnemy(position) {
            let radius = random.pick(1.5, 2, 1.75)

            set({
                enemies: [
                    ...get().enemies,
                    {
                        id: uuid.v4(),
                        radius,
                        position: [
                            random.integer(-(Config.BLOCK_WIDTH / 2) + radius, Config.BLOCK_WIDTH / 2 - radius),
                            position[1] + radius * 1.5,
                            position[2] + radius
                        ],
                        speed: random.float(-3, -7)
                    }
                ]
            })
        },
        removeEnemy(id) {
            set({
                enemies: get().enemies.filter(i => i.id !== id)
            })
        },
        maintainPath() {
            let { position, blocks, addBlock, clearBlocks } = get()
            let forwardBlock = blocks[0]
            let forwardBuffer = 42

            while (forwardBlock.end - position.z < forwardBuffer) {
                forwardBlock = addBlock()
            }

            clearBlocks(position.z)
        },
        clearBlocks(z) {
            let { blocks } = get()
            let backwardBuffer = 0
            let f = blocks.map(i => {
                let dead = false

                if (i.end < z - backwardBuffer) {
                    dead = true
                }

                return dead ? { ...i, dead } : i
            })

            set({
                blocks: f
            })
        },
        removeBlock(id) {
            let { blocks } = get()

            set({ blocks: blocks.filter(i => i.id !== id) })
        },
        addBlock() {
            let { blocks, distance, nextDistanceThreshold } = get()
            let forwardBlock = blocks[0]
            let nextBlock = getBlock(forwardBlock)

            if (nextBlock.end > nextDistanceThreshold) {
                distance += Config.DISTANCE_INCREMENT
                nextDistanceThreshold += Config.DISTANCE_INCREMENT

                nextBlock.distance = distance
            }

            set({
                blocks: [nextBlock, ...blocks],
                distance,
                nextDistanceThreshold
            })

            return nextBlock
        }
    }
})

function getBlock(previous) {
    let stepUp = [BlockType.NARROW].includes(previous.type) ? false : random.boolean(.9)
    let type = getNextType(previous)
    let block = {
        id: uuid.v4(),
        start: previous.end,
        width: random.integer(Config.BLOCK_WIDTH, Config.BLOCK_WIDTH + Config.BLOCK_MAX_EXTRA_WIDTH),
        previousType: previous.type,
        stepUp,
        type,
        ...makeBlock[type](previous)
    }


    return {
        ...block,
        end: block.start + block.depth,
        y: previous.y + (block.stepUp ? 2 : 0)
    }
}

function getNextType(previous) {
    let types = [
        ...Object.values(BlockType).filter(i => i !== BlockType.START),
        BlockType.OBSTACLES,
        BlockType.OBSTACLES,
        BlockType.OBSTACLES,
        BlockType.OBSTACLES,
    ]
    let illegalNext = {
        [BlockType.START]: [BlockType.NARROW],
        [BlockType.PLAIN]: [BlockType.PLAIN],
        [BlockType.OBSTACLES]: [],
        [BlockType.NARROW]: []
    }
    let type = random.pick(...types)

    while (illegalNext[previous.type].includes(type)) {
        type = random.pick(...types)
    }

    return type
}

const makeBlock = {
    [BlockType.START]() {
        return {
            depth: 35
        }
    },
    [BlockType.PLAIN]() {
        return {
            depth: random.integer(7, 10)
        }
    },
    [BlockType.OBSTACLES]() {
        return {
            depth: random.integer(15, 20)
        }
    },
    [BlockType.NARROW](previous) {
        return {
            depth: previous.type === BlockType.NARROW ? 11 : 16,
            width: 7,
            stepUp: false
        }
    }
}


export { api, useStore }