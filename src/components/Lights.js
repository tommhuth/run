import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import { useThree, useFrame } from "react-three-fiber"
import GameState from "../data/const/GameState"
import { PCFSoftShadowMap } from "three"

export default function Lights() {
    let ref = useRef()
    let ref2 = useRef()
    let ref3 = useRef()
    let { gl } = useThree()
    let state = useStore(state => state.data.state)

    useEffect(() => {
        ref3.current.target.updateMatrixWorld()
    }, [])
 
    useEffect(() => {
        api.subscribe(
            (pos) => ref2.current.position.set(pos.x, pos.y, pos.z),
            state => state.data.position
        )

        gl.shadowMap.enabled = false
        gl.shadowMap.type = PCFSoftShadowMap
        gl.physicallyCorrectLights = true   
    }, [])  

    return (
        <>
            <directionalLight
                ref={ref3}
                color={0xffffff}
                position={[0, 5, 0]}
                intensity={1}
                target-position={[3, -5, 5]}
            />
            <pointLight
                ref={ref2}
                args={[0xFFED66, 4, 15, 1]}
                intensity={state=== GameState.RUNNING ? 4 : 0}
            /> 
        </>
    )
}

/*


            <ambientLight
                intensity={.5}
                color={0xffffff}
            />
            */