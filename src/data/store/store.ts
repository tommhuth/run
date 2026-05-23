import { SpatialHashGrid3D } from "@data/SpatialHashGrid3D"
import { RigidVehicle } from "cannon-es"
import { DepthTexture, Group, Material, PointLight, Vector3 } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

import { Tuple3 } from "../../types/global"
import { Instance, InstanceName, MaterialName } from "./actions/actions"
import { generateForestPart } from "./actions/road"
import { initializeTraffic } from "./actions/traffic"

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

export interface Message {
    id: string
    text: string
    score?: number
    color?: string
}

export interface RunStore {
    state: "intro" | "gameover" | "running"
    instances: Record<InstanceName, Instance>
    depthTexture: null | DepthTexture
    materials: Record<MaterialName, Material>
    traffic: TrafficElement[]
    road: RoadPart[]
    grid: SpatialHashGrid3D
    messages: Message[]
    loading: boolean
    debug: {
        showColliders: boolean
        godMode: boolean
    }
    shared: {
        pointLight: null | PointLight
    }
    player: {
        mesh: Group | null
        vehicle: RigidVehicle | null
        steering: Vector3
        pickupCounter: number
        pickupInterval: number
        pickupDeadline: number
        score: number
        potentialScore: number
        time: number
    }
}

const store = create(
    subscribeWithSelector<RunStore>(() => ({
        state: "intro",
        player: {
            mesh: null,
            vehicle: null,
            steering: new Vector3(),
            pickupInterval: 4,
            pickupCounter: 4,
            pickupDeadline: Infinity,
            potentialScore: 0,
            score: 0,
            time: 0
        },
        grid: new SpatialHashGrid3D([4, 4, 4]),
        traffic: initializeTraffic(),
        road: [
            generateForestPart({ position: [0, 0, -10], depth: 0 }),
        ],
        depthTexture: null,
        materials: {} as RunStore["materials"],
        instances: {} as RunStore["instances"],
        shared: {
            pointLight: null
        },
        messages: [],
        loading: true,
        debug: {
            showColliders: false,
            godMode: false,
        },
    } satisfies RunStore))
)

const useStore = store

export { store, useStore }
