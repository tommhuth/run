import { Tuple2, Tuple3 } from "@src/types/global"

type Key = `${number},${number}`

interface Cell {
    occupied: boolean
    position: Tuple3
}

export default class PlaceGrid {
    public readonly origin: Tuple3
    public readonly cellSize: number
    private occupancies: Map<Key, Cell> = new Map()

    constructor(size: Tuple2, cellSize: number, origin: Tuple3) {
        this.cellSize = cellSize
        this.origin = origin

        for (let x = -size[0] / 2; x < size[0] / 2; x++) {
            for (let z = -size[1] / 2; z < size[1] / 2; z++) {
                this.occupancies.set(this.getKey(x, z), {
                    occupied: false,
                    position: this.getWorldPositionFromIndex(x, z)
                })
            }
        }
    }

    [Symbol.iterator]() {
        return this.occupancies.entries()
    }

    private getGridIndices([x, , z]: Tuple3) {
        const xi = Math.floor((x - this.origin[0]) / this.cellSize)
        const zi = Math.floor((z - this.origin[2]) / this.cellSize)

        return [xi, zi] as const
    }

    public getWorldPositionFromIndex(xi: number, zi: number): Tuple3 {
        return [
            xi * this.cellSize + this.origin[0] + this.cellSize / 2,
            0,
            zi * this.cellSize + this.origin[2] + this.cellSize / 2,
        ] as const
    }

    public getIndexFromKey(key: Key): Tuple2 {
        const [x, z] = key.split(",")

        return [parseFloat(x), parseFloat(z)] as const
    }

    private getKey(xi: number, zi: number): Key {
        return `${xi},${zi}`
    }

    public occupy(worldPos: Tuple3) {
        const cell = this.occupancies.get(this.getKey(...this.getGridIndices(worldPos)))

        if (cell) {
            cell.occupied = true
        }
    }

    public getPositions() {
        const result: Tuple3[] = []

        for (const cell of this.occupancies.values()) {
            if (!cell.occupied) {
                result.push(cell.position)
            }
        }

        return result
    }

    public getRandomPositions() {
        const result = this.getPositions() // avoid mutating original (remove if mutation is fine)

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] = [result[j], result[i]]
        }

        return result
    }
}
