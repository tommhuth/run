import create from "zustand" 
import Config from "../Config"
import random from "@huth/random"
import GameState from "../data/const/GameState"
import BlockType from "./const/BlockType"
import { getBlock } from "./utils"

const mustRequestOrientationAccess = window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission
const initState = {
    hasDeviceOrientation: !mustRequestOrientationAccess,
    mustRequestOrientationAccess,
    state: mustRequestOrientationAccess ? GameState.REQUEST_ORIENTATION_ACCESS : GameState.READY,
    blocks: [
        {
            start: 25,
            end: 45,
            depth: 20,
            id: random.id(),
            width: Config.BLOCK_WIDTH - 1,
            type: BlockType.OBSTACLES,
            coinLikelihood: 0,
            obstacleCount: 2,
            hasEnemies: false,
            initial: true,
            delay: 750,
            y: 0,
            step: -2
        },
        {
            start: 0,
            end: 25,
            depth: 25,
            id: random.id(),
            width: Config.BLOCK_WIDTH + 2,
            type: BlockType.OBSTACLES,
            coinLikelihood: 0,
            obstacleCount: 2,
            hasEnemies: false,
            initial: true,
            delay: 500,
            y: 2,
            step: 2
        },
        {
            start: -20,
            end: 0,
            depth: 20,
            id: random.id(),
            width: Config.BLOCK_WIDTH - 2, 
            type: BlockType.OBSTACLES,
            hasEnemies: false,
            initial: true,
            obstacleCount: 3,
            coinLikelihood: 0,
            delay: 0,
            y: 0,
            step: 0
        },
    ],
    enemies: [],
    attempts: 0,
    position: {
        x: Config.PLAYER_START[0],
        y: Config.PLAYER_START[1],
        z: Config.PLAYER_START[2]
    },
    gameOverReason: null,
    canStart: false,
    distance: 0,
    nextDistanceThreshold: Config.DISTANCE_INCREMENT,
    score: 0,
}

const [useStore, api] = create((set, get) => {
    return {
        ...initState,

        // actions
        canBegin() {
            set({ canStart: true })
        },
        start() {
            if (get().canStart) {
                set({ state: GameState.RUNNING })
            }
        },
        end(reason) {
            let { position } = get()

            set({ state: GameState.GAME_OVER, gameOverReason: reason, score: Math.floor(position.z) })
        },
        reset() {
            let {
                hasDeviceOrientation,
                mustRequestOrientationAccess,
                attempts,
                canStart
            } = get()

            if (canStart) {
                let data = {
                    ...initState,
                    state: GameState.RUNNING,
                    attempts: attempts + 1,
                    hasDeviceOrientation,
                    mustRequestOrientationAccess
                }

                for (let [index, block] of data.blocks.entries()) {
                    block.id = random.id() 
                    block.reset = true
                    block.delay = (data.blocks.length- index ) * 150
                }

                set(data)
            }
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
                        id: random.id(),
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
            let forwardBuffer = 32

            while (forwardBlock.end - position.z < forwardBuffer) {
                forwardBlock = addBlock()
            }

            clearBlocks(position.z)
        },
        clearBlocks(z) {
            let { blocks } = get()
            let backwardBuffer = 0 

            set({
                blocks: blocks.map(i => {
                    let dead = false
    
                    if (i.end < z - backwardBuffer) {
                        dead = true
                    }
    
                    return dead ? { ...i, dead } : i
                })
            })
        },
        removeBlock(id) {
            let { blocks } = get()

            set({ blocks: blocks.filter(i => i.id !== id) })
        },
        addBlock() {
            let { blocks, distance, nextDistanceThreshold } = get()
            let nextBlock = getBlock(blocks) 

            if (nextBlock.end > nextDistanceThreshold) {
                distance += Config.DISTANCE_INCREMENT
                nextDistanceThreshold += Config.DISTANCE_INCREMENT

                nextBlock.distance = distance
            }

            set({
                blocks: [nextBlock, ...blocks],
                distance,
                nextDistanceThreshold,
                delay: 0
            })

            return nextBlock
        }
    }
})



export { api, useStore }