import random from "@huth/random"
import { Body } from "cannon-es"
import { DepthTexture, Material, Mesh } from "three"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

import { Tuple3 } from "../../types/global"
import { hasRequestMotionPermission, Instance, InstanceName, MaterialName } from "./actions"

export interface PathSection {
    id: string
    size: Tuple3
    position: Tuple3
    fixed?: boolean
    gap: boolean
}

export interface RunStore {
    state: "intro" | "gameover" | "running"
    hasMotionAccess: boolean
    motionAccessDenied: boolean
    path: PathSection[]
    instances: Record<InstanceName, Instance>
    depthTexture: null | DepthTexture
    materials: Record<MaterialName, Material>
    player: {
        mesh: Mesh | null
        body: Body | null
    }
}

const store = create(
    subscribeWithSelector<RunStore>(() => ({
        state: "intro",
        hasMotionAccess: hasRequestMotionPermission ? false : true,
        depthTexture: null,
        motionAccessDenied: false,
        materials: {} as RunStore["materials"],
        instances: {} as RunStore["instances"],
        player: {
            mesh: null,
            body: null
        },
        path: [
            {
                id: random.id(),
                size: [5, 20, 5],
                position: [0, -10.1, 0],
                fixed: true,
                gap: false
            }
        ]
    }))
)

const useStore = store

export { store, useStore }
