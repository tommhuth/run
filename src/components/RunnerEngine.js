
import React, { useEffect } from "react"
import { useThree } from "react-three-fiber"
import { useSelector } from "react-redux"
import { Fog } from "three"
import { getBlocks } from "../store/selectors/run"
import { init, clean } from "../store/actions/run"
import { useActions, useThrottledRender } from "../utils/hooks"
import Block from "./Block"
import Player from "./Player"

export default function RunnerEngine() {
    let blocks = useSelector(getBlocks)
    let actions = useActions({ init, clean })
    let { scene } = useThree()

    useEffect(() => {
        actions.init() 
        scene.fog = new Fog(0xFFFFFF, 7, 40) 
    }, [])

    useThrottledRender(actions.clean, 1000, [])

    return (
        <>
            <Player />

            {blocks.map(i => {
                return <Block key={i.id} {...i} />
            })}

        </>
    )
}
