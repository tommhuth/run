import { RigidVehicle } from "cannon-es"
import { DepthTexture, Group, Material } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

import { Tuple3 } from "../../types/global"
import { generateForestPart, generatePickupPoint, initializeTraffic, Instance, InstanceName, MaterialName } from "./actions"

interface RoadObject {
    id: string
    position: Tuple3
    rotation: Tuple3
}

export interface StreetLightObject extends RoadObject {
    type: "light"
}

export interface TreeObject extends RoadObject {
    treeType: number
    scale: number
}

export interface RockObject extends RoadObject {
    radius: number
    scale: Tuple3
}

export interface TrafficElement {
    id: string
    type: "sedan"
    position: Tuple3
    rotation: Tuple3
    guide: Tuple3
    velocity?: number
    direction: 1 | -1
}

export interface RoadPart {
    id: string
    type: "forest" | "rocks" | "bridge" | "pickupPoint"
    position: Tuple3
    depth: number
}

export interface RunStore {
    state: "intro" | "gameover" | "running"
    instances: Record<InstanceName, Instance>
    depthTexture: null | DepthTexture
    materials: Record<MaterialName, Material>
    traffic: TrafficElement[]
    road: RoadPart[]
    debug: {
        showColliders: boolean
        godMode: boolean
    }
    player: {
        mesh: Group | null
        vehicle: RigidVehicle | null
    }
}

const store = create(
    subscribeWithSelector<RunStore>(() => ({
        state: "intro",
        depthTexture: null,
        materials: {} as RunStore["materials"],
        instances: {} as RunStore["instances"],
        player: {
            mesh: null,
            vehicle: null
        },
        road: [
            generateForestPart({ position: [0, 0, -10], depth: 0 }),
            //generatePickupPoint({ position: [0, 0, -5], depth: 0 }),
            generateForestPart({ position: [0, 0, -10], depth: 20 }),
        ],
        debug: {
            showColliders: false,
            godMode: false,
        },
        traffic: initializeTraffic(),
    }))
)

const useStore = store

export { store, useStore }
