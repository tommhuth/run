import { Tuple3 } from "src/types/global"

export interface Client {
    position: Tuple3
    size: Tuple3
    min: Tuple3
    max: Tuple3
    data: ClientData
}

export interface ClientData {
    id: string
    type: string
}

export class SpatialHashGrid3D {
    private grid = new Map<string, Client[]>()
    private cellSize: Tuple3

    constructor(cellSize: Tuple3) {
        this.cellSize = cellSize
    }

    private getCellIndex(x: number, y: number, z: number): Tuple3 {
        return [
            Math.floor(x / this.cellSize[0]),
            Math.floor(y / this.cellSize[1]),
            Math.floor(z / this.cellSize[2])
        ]
    }

    private getCellBounds(position: Tuple3, size: Tuple3): [min: Tuple3, max: Tuple3] {
        return [
            this.getCellIndex(position[0] - size[0] / 2, position[1] - size[1] / 2, position[2] - size[2] / 2),
            this.getCellIndex(position[0] + size[0] / 2, position[1] + size[1] / 2, position[2] + size[2] / 2),
        ]
    }

    private getHashKey(ix: number, iy: number, iz: number): string {
        return `${ix},${iy},${iz}`
    }

    private insert(client: Client) {
        const [min, max] = this.getCellBounds(client.position, client.size)

        client.min = min
        client.max = max

        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                for (let z = min[2]; z <= max[2]; z++) {
                    const key = this.getHashKey(x, y, z)
                    const cell = this.grid.get(key)

                    if (cell) {
                        cell.push(client)
                    } else {
                        this.grid.set(key, [client])
                    }
                }
            }
        }
    }

    public findNear(position: Tuple3, size: Tuple3) {
        const [min, max] = this.getCellBounds(position, size)
        const result: Client[] = []

        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                for (let z = min[2]; z <= max[2]; z++) {
                    const key = this.getHashKey(x, y, z)
                    const cell = this.grid.get(key)

                    if (cell) {
                        for (const client of cell) {
                            if (!result.includes(client)) {
                                result.push(client)
                            }
                        }
                    }
                }
            }
        }

        return result
    }

    public createClient(position: Tuple3, size: Tuple3, data: ClientData) {
        const client = {
            position,
            size,
            data,
            min: [0, 0, 0] as Tuple3,
            max: [0, 0, 0] as Tuple3,
        }

        this.insert(client)

        return client
    }

    public remove(client: Client) {
        for (let x = client.min[0]; x <= client.max[0]; x++) {
            for (let y = client.min[1]; y <= client.max[1]; y++) {
                for (let z = client.min[2]; z <= client.max[2]; z++) {
                    const key = this.getHashKey(x, y, z)
                    const cell = this.grid.get(key)

                    if (cell) {
                        const cellUpdated = cell.filter(i => i !== client)

                        if (cellUpdated.length === 0) {
                            this.grid.delete(key)
                        } else {
                            this.grid.set(key, cellUpdated)
                        }
                    }
                }
            }
        }
    }

    public updateClient(client: Client) {
        const [min, max] = this.getCellBounds(client.position, client.size)

        if (
            client.max[0] !== max[0]
            || client.max[1] !== max[1]
            || client.max[2] !== max[2]
            || client.min[0] !== min[0]
            || client.min[1] !== min[1]
            || client.min[2] !== min[2]
        ) {
            this.remove(client)
            this.insert(client)
        }
    }
}