
import React, { useEffect, useState , createRef } from "react"
import { useSelector } from "react-redux"
import { useThree } from "react-three-fiber" 
import { getState } from "../store/selectors/run"
import GameState from "../const/GameState"
import {CameraHelper} from "three"
import { useWorld, getPlayer } from "../utils/cannon"
import { useThrottledRender } from "../utils/hooks"

export default function Lights() {
    let { gl, scene } = useThree()
    let world = useWorld() 
    let state = useSelector(getState)
    let ref = createRef() 

    useEffect(() => {
        gl.shadowMap.enabled = true
 
        let helper = new CameraHelper(ref.current.shadow.camera)
        scene.add(helper)
    }, [ref.current, gl])

    useThrottledRender(()=> {
        if (state === GameState.ACTIVE) { 
            let player = getPlayer(world)

            if (player && ref.current) { 
                ref.current.target.position.z = player.position.z + 1
                ref.current.position.z = player.position.z  
                ref.current.target.updateMatrixWorld() 
            }

        }
    }, 500, [state, world])

    return (
        <>
            <ambientLight
                color={0x00a6ff}
                intensity={.2}
            />
            <directionalLight
                color={0xFFFFFF}
                castShadow={true}
                intensity={1}
                ref={ref}
                position={[0, 0, 0]}
                target-position={[3, -10, 1]}
                shadow-camera-near={-1} // y
                shadow-camera-far={10} //y
                shadow-camera-left={-2} //z
                shadow-camera-right={18} //z
                shadow-camera-bottom={-6} //x
                shadow-camera-top={6} //x
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024} 
                onUpdate={(self) => {
                    self.target.updateMatrixWorld() 
                }}
            />
        </>
    )
}
