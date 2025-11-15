import { initializeRocks } from "@components/road/Rock"
import { initializeTrees } from "@components/road/Tree"
import { PlacementGrid } from "@data/PlacementGrid"
import { RigidVehicle } from "cannon-es"
import { DepthTexture, Group, Material } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

import { Tuple3 } from "../../types/global"
import { Instance, InstanceName, MaterialName } from "./actions"

interface RoadObject {
    id: string
    active: boolean
    position: Tuple3
    rotation: Tuple3
}

export interface StreetLightObject extends RoadObject {
    type: "light"
}

export interface TreeObject extends RoadObject {
    type: "tree"
    treeType: number
    scale: number
}

export interface RockObject extends RoadObject {
    type: "rock"
    radius: number
    scale: Tuple3
}

export interface RunStore {
    state: "intro" | "gameover" | "running"
    instances: Record<InstanceName, Instance>
    depthTexture: null | DepthTexture
    materials: Record<MaterialName, Material>
    objects: (StreetLightObject | RockObject | TreeObject)[]
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
        grid: new PlacementGrid(1),
        objects: [
            ...initializeRocks(),
            ...initializeTrees(),
        ]
    }))
)

const useStore = store

export { store, useStore }
