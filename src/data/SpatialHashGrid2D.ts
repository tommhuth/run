import { RigidVehicle } from "cannon-es"
import { Tuple2, Tuple3 } from "src/types/global"
import { Vector3Like } from "three"

interface Bounds {
    minX: number
    minZ: number
    maxX: number
    maxZ: number
}

export interface Client extends Bounds {
    position: Tuple3
    size: Tuple2
    lastQueryId: number
    data: ClientData
}

export interface ClientData {
    type: "traffic" | "player"
    vehicle: RigidVehicle
    direction?: number
}

export class SpatialHashGrid2D {
    private grid = new Map<number, Map<number, Set<Client>>>()
    private cellSizeX: number
    private cellSizeZ: number
    private queryId = 0
    private scratchBounds: Bounds = { minX: 0, minZ: 0, maxX: 0, maxZ: 0 }

    constructor(cellSize: Tuple2) {
        this.cellSizeX = cellSize[0]
        this.cellSizeZ = cellSize[1]
    }

    private computeBounds(position: Tuple3 | Vector3Like, size: Tuple2, out: Bounds) {
        const x = Array.isArray(position) ? position[0] : position.x
        const z = Array.isArray(position) ? position[2] : position.z
        const halfX = size[0] / 2
        const halfZ = size[1] / 2

        out.minX = Math.floor((x - halfX) / this.cellSizeX)
        out.minZ = Math.floor((z - halfZ) / this.cellSizeZ)
        out.maxX = Math.floor((x + halfX) / this.cellSizeX)
        out.maxZ = Math.floor((z + halfZ) / this.cellSizeZ)
    }

    private getCell(x: number, z: number) {
        return this.grid.get(x)?.get(z)
    }

    private getOrCreateCell(x: number, z: number) {
        let column = this.grid.get(x)

        if (!column) {
            column = new Map()
            this.grid.set(x, column)
        }

        let cell = column.get(z)

        if (!cell) {
            cell = new Set()
            column.set(z, cell)
        }

        return cell
    }

    private insert(client: Client) {
        this.computeBounds(client.position, client.size, client)

        for (let x = client.minX; x <= client.maxX; x++) {
            for (let z = client.minZ; z <= client.maxZ; z++) {
                this.getOrCreateCell(x, z).add(client)
            }
        }
    }

    public findNear(position: Tuple3 | Vector3Like, size: Tuple2) {
        const bounds = this.scratchBounds

        this.computeBounds(position, size, bounds)

        const result: Client[] = []
        const queryId = ++this.queryId

        for (let x = bounds.minX; x <= bounds.maxX; x++) {
            for (let z = bounds.minZ; z <= bounds.maxZ; z++) {
                const cell = this.getCell(x, z)

                if (cell) {
                    for (const client of cell) {
                        if (client.lastQueryId !== queryId) {
                            client.lastQueryId = queryId
                            result.push(client)
                        }
                    }
                }
            }
        }

        return result
    }

    public createClient(position: Tuple3, size: Tuple2, data: ClientData): Client {
        const client: Client = {
            position,
            size,
            data,
            minX: 0,
            minZ: 0,
            maxX: 0,
            maxZ: 0,
            lastQueryId: 0,
        }

        this.insert(client)

        return client
    }

    public remove(client: Client) {
        for (let x = client.minX; x <= client.maxX; x++) {
            for (let z = client.minZ; z <= client.maxZ; z++) {
                const column = this.grid.get(x)
                const cell = column?.get(z)

                if (cell && column) {
                    cell.delete(client)

                    if (cell.size === 0) {
                        column.delete(z)

                        if (column.size === 0) {
                            this.grid.delete(x)
                        }
                    }
                }
            }
        }
    }

    public updateClient(client: Client) {
        const bounds = this.scratchBounds

        this.computeBounds(client.position, client.size, bounds)

        if (
            client.minX !== bounds.minX
            || client.minZ !== bounds.minZ
            || client.maxX !== bounds.maxX
            || client.maxZ !== bounds.maxZ
        ) {
            this.remove(client)
            this.insert(client)
        }
    }
}
