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
        this.grid.delete(this.getHashKey(x * this.cellSize, y * this.cellSize))
    }

    public occupy(ix: number, iy: number) {
        this.grid.set(this.getHashKey(ix, iy), true)
    }

    getRandomPosition(xrange: Tuple2, yrange: Tuple2) {
        const makePosition = () => {
            const x = random.float(...xrange)
            const y = random.float(...yrange)
            const [ix, iy] = this.getCellIndex(x, y)
            const key = this.getHashKey(ix, iy)
            const res = this.grid.has(key)

            return res || [ix * this.cellSize, iy * this.cellSize] as const
        }
        let result = makePosition()

        while (result === true) {
            result = makePosition()
            console.log("retry")
        }

        this.occupy(...result)

        return result
    }
}

export const grid = new PlacementGrid(2)
