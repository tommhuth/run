
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useThree, useRender } from "react-three-fiber" 
import { getState } from "../store/selectors/run"
import GameState from "../const/GameState"
import { useWorld } from "../utils/cannon"
import { useThrottledRender } from "../utils/hooks"

export default function Lights() {
    let { gl } = useThree()
    let world = useWorld()
    let [z, setZ] = useState(0) 
    let state = useSelector(getState)

    useEffect(() => {
        gl.shadowMap.enabled = true
    }, [])

    useThrottledRender(()=> {
        if (state === GameState.ACTIVE) { 
            let z = world.bodies.find(i => i.xname === "player").position.z

            setZ(z)
        }
    }, 500, [state, world])

    return (
        <>
            <ambientLight
                color={0x6666FF}
                intensity={.1}
            />
            <directionalLight
                color={0xFFFFFF}
                castShadow={true}
                intensity={1}
                position={[0, 0, z]}
                target-position={[3, -10, z + 1]}
                onUpdate={(self) => {
                    self.target.updateMatrixWorld()
                    self.shadow.mapSize.width = 512 * 2
                    self.shadow.mapSize.height = 512 * 2
                    self.shadow.camera.near = -10
                    self.shadow.camera.far = 10
                    self.shadow.camera.left = -30
                    self.shadow.camera.right = 30
                    self.shadow.camera.top = 10
                    self.shadow.camera.bottom = -20
                }}
            />
        </>
    )
}
