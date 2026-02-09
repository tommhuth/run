import random from "@huth/random"
import { RigidVehicle } from "cannon-es"
import { DepthTexture, Group, Material } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

import { Tuple3 } from "../../types/global"
import { initializeTraffic, Instance, InstanceName, MaterialName } from "./actions"

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

interface RoadPart {
    id: string
    type: string
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
            {
                id: random.id(),
                position: [0, 0, -5],
                depth: 20,
                type: "plain"
            }
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
