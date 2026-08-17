import { ROAD_DEPTH } from "@components/road/const"
import { SpatialHashGrid2D } from "@data/SpatialHashGrid2D"
import { RigidVehicle } from "cannon-es"
import { DepthTexture, Group, Material, Texture, Vector3 } from "three"
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

export interface BushObject extends Omit<RoadObject, "rotation"> {
    count: number
}

export interface TrafficElement {
    id: string
    position: Tuple3
    rotation: Tuple3
    guide: Tuple3
    velocity?: number
    vehicle: RigidVehicle | null
    direction: 1 | -1
}

export type RoadPart = ForestPart | RocksPart | BridgePart

export interface BaseRoadPart {
    id: string
    position: Tuple3
    depth: number
}

export interface RocksPart extends BaseRoadPart {
    type: "rocks"
}

export interface BridgePart extends BaseRoadPart {
    type: "bridge"
}

export interface ForestPart extends BaseRoadPart {
    dense: boolean
    leafAnchor: boolean
    type: "forest"
}

export interface Leaf {
    id: string
    index: number
    position: Tuple3
    velocity: Tuple3
    scale: number
    time: number
}

export interface RunStore {
    state: "intro" | "gameover" | "running"
    instances: Record<InstanceName, Instance>
    depthTexture: null | DepthTexture
    aoTexture: null | Texture
    materials: Record<MaterialName, Material>
    traffic: TrafficElement[]
    leaves: Leaf[]
    road: RoadPart[]
    grid: SpatialHashGrid2D
    loading: boolean
    debug: {
        showColliders: boolean
        godMode: boolean
        aoEnabled: boolean
        showAoDebug: boolean
        physicsTime: number
        bodies: number
        nextPartOverride: RoadPart["type"] | null
    }
    player: {
        mesh: Group | null
        vehicle: RigidVehicle | null
        steering: Vector3
        nextTargetAt: number
        targetDistance: number
        score: number
        time: number
        deadline: number
    },
}

const store = create(
    subscribeWithSelector<RunStore>(() => ({
        state: "intro",
        player: {
            mesh: null,
            vehicle: null,
            steering: new Vector3(),
            nextTargetAt: 200,
            targetDistance: 200,
            deadline: Infinity,
            score: 0,
            time: 0
        },
        grid: new SpatialHashGrid2D([4, 4]),
        traffic: initializeTraffic(),
        leaves: [],
        road: [generateForestPart, generateForestPart, generateForestPart].map((generator, index) => {
            const startZ = -40
            const previousPart: Parameters<typeof generator>[0] = {
                position: [0, 0, startZ + index * ROAD_DEPTH],
                depth: ROAD_DEPTH,
            }

            return generator(previousPart, true)
        }),
        depthTexture: null,
        aoTexture: null,
        materials: {} as RunStore["materials"],
        instances: {} as RunStore["instances"],
        loading: true,
        debug: {
            showColliders: false,
            godMode: false,
            aoEnabled: true,
            showAoDebug: false,
            physicsTime: 0,
            bodies: 0,
            nextPartOverride: null
        },
    } satisfies RunStore))
)

const useStore = store

export { store, useStore }
