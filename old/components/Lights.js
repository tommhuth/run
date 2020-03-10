import React, { useEffect, useRef } from "react"
import { api, useStore } from "../data/store"
import { useThree, useFrame } from "react-three-fiber"
import GameState from "../data/const/GameState"
import { PCFSoftShadowMap } from "three"

export default function Lights() { 
    let ref2 = useRef()
    let ref3 = useRef()
    let { gl } = useThree()
    let state = useStore(state => state.data.state)

    useEffect(() => {
        ref3.current.target.updateMatrixWorld()
    }, [])
 
    useEffect(() => {
        api.subscribe(
            (pos) => {
                ref2.current.position.set(pos.x, pos.y, pos.z)
                //console.log(gl && gl.info.render)
            },
            state => state.data.position
        )
       
        

        ///gl.shadowMap.enabled = true
        //gl.shadowMap.type = PCFSoftShadowMap 
    }, [gl])  
    //console.log("render")

    return (
        <>
            <ambientLight intensity={.5} color={0xf2faff} />
            <directionalLight
                ref={ref3}
                color={0xf2faff}
                position={[0, 5, 0]}
                intensity={.5}
                target-position={[3, -3, 5]}
            />
            <ambientLight
                ref={ref2} 
                args={[0x00222b, .5, 10, 2]}
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