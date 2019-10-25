import create from "zustand"
import uuid from "uuid"
import random from "./random"
import BlockSettings from "./const/BlockSettings"
import GameState from "./const/GameState"
import BlockType from "./const/BlockType"

function getBlock(previous) {
    let blocks = Object.values(BlockType)
    let options = {
        type: random.pick(blocks),
        id: uuid.v4(),
        start: previous.end
    }

    while (previous && BlockSettings[previous.type].illegalNext.includes(options.type)) {
        options.type = random.pick(blocks)
    }

    switch (options.type) {
        case BlockType.EMPTY:
            options.depth = random.integer(4, 8)
            break
        case BlockType.GAP:
            options.depth = random.integer(2, 3)
            break
    }

    options.end = options.start + options.depth

    return options
}

const [useStore, api] = create((set, get) => {
    const init = {
        blocks: [
            {
                id: uuid.v4(),
                type: BlockType.EMPTY,
                depth: 14,
                start: 0,
                end: 14
            },
            {
                id: uuid.v4(),
                type: BlockType.GAP,
                depth: 2,
                start: 14,
                end: 16
            },
            {
                id: uuid.v4(),
                type: BlockType.EMPTY,
                depth: 8,
                start: 16,
                end: 24
            },
        ],
        spheres: [],
        state: GameState.READY,
        lives: 3,
        score: 0,
        bombs: 0,
        position: { x: 0, y: 0, z: 0 },
    }

    return {
        data: {
            ...init
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
            reset() {
                set({
                    data: {
                        ...init,
                        state: GameState.RUNNING
                    }
                })
            },
            resume() {
                set({ data: { ...get().data, state: GameState.RUNNING } })
            },
            end() {
                set({
                    data: {
                        ...get().data,
                        state: GameState.GAME_OVER
                    }
                })
            },
            maintainPath() {
                let { blocks, position } = get().data
                let { addBlock } = get().actions
                let previous = blocks[blocks.length - 1]
                let buffer = 30

                if (previous.end - position.z < buffer) {
                    addBlock()
                }
            },
            addBlock() {
                let { blocks, position, ...rest } = get().data
                let previous = blocks[blocks.length - 1]
                let next = getBlock(previous)
                let buffer = 16 // backwards cutoff distance from ball
                let futureBlocks = blocks.filter(i => i.start + i.depth > position.z - buffer)

                set({
                    data: {
                        ...rest,
                        position,
                        blocks: [...futureBlocks, next]
                    }
                })
            },
            setPosition(x, y, z) {
                set({
                    data: {
                        ...get().data,
                        position: { x, z, y }
                    }
                })
            }
        }
    }
})

window.api = api

export { useStore, api }


/*



                if (lives > 0) {
                    console.log(blocks[0])
                    set({
                        data: {
                            ...get().data,
                            lives: lives - 1,
                            state: GameState.LIFE_LOST_INTERTITLE,
                            position: { x: 0, y: 5, z: blocks[0].start +  blocks[0].end - blocks[0].start }
                        }
                    })
                } else {

                    */