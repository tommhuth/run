import random from "@huth/random"
import { Tuple2 } from "@src/types/global"

export class PlacementGrid {
    private grid: Map<string, boolean> = new Map()
    private cellSize: number

    constructor(cellSize: number) {
        this.cellSize = cellSize
    }

    private getCellIndex(x: number, y: number): Tuple2 {
        return [
            Math.floor(x / this.cellSize),
            Math.floor(y / this.cellSize),
        ]
    }

    private getHashKey(ix: number, iy: number): string {
        return `${ix}.${iy}`
    }

    public release(x: number, y: number) {
        const [ix, iy] = this.getCellIndex(x, y)

        this.grid.delete(this.getHashKey(ix, iy))
    }

    public occupy(ix: number, iy: number) {
        this.grid.set(this.getHashKey(ix, iy), true)
    }

    public clean(ystart: number, steps = 10) {
        const [, iy] = this.getCellIndex(0, ystart)

        for (let y = iy - this.cellSize * steps; y < iy; y++) {

        }
    }

    getRandomPosition(xrange: Tuple2, yrange: Tuple2, maxAttempts = 100) {
        const makePosition = () => {
            const x = random.float(...xrange)
            const y = random.float(...yrange)
            const [ix, iy] = this.getCellIndex(x, y)
            const key = this.getHashKey(ix, iy)
            const isOccupied = this.grid.has(key)

            return isOccupied || [ix, iy] as const
        }
        let result = makePosition()
        let attempts = 0

        while (result === true) {
            result = makePosition()
            attempts++

            if (attempts > maxAttempts) {
                throw new Error("Grid max attempts for position")
            }
        }

        this.occupy(...result)

        return result.map(i => i * this.cellSize)
    }
}

export const grid = new PlacementGrid(2)
