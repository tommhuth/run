
import React, { useEffect } from "react"
import { useCannon } from "../../data/cannon"
import Config from "../../Config"
import { Vec3, Box } from "cannon-es"
import materials from "../../shared/materials" 
import animate from "@huth/animate"
import { useStore } from "../../data/store"
import Coin from "../actors/Coin"
import BlockType from "../../data/const/BlockType"

function NarrowBlock(props) {
    let platformDepth = 5
    let z = props.previousType === BlockType.NARROW ? props.start + platformDepth / 2 : props.start + props.depth / 2
    let { ref, body } = useCannon({
        mass: 0,
        rotation: [],
        shape: new Box(
            new Vec3(props.width / 2, Config.BLOCK_HEIGHT / 2, platformDepth / 2)
        ),
        position: [
            0,
            -Config.BLOCK_HEIGHT,
            z
        ]
    })
    let removeBlock = useStore(i => i.removeBlock)

    useEffect(() => {
        return animate({
            from: body.position.y,
            to: -Config.BLOCK_HEIGHT / 2 + props.y,
            duration: Config.BLOCK_IN_DURATION,
            easing: Config.BLOCK_IN_EASING,
            render(y) {
                body.position.y = y
            }
        })
    }, [])

    useEffect(() => {
        if (props.dead) {
            return animate({
                from: body.position.y,
                to: -Config.BLOCK_HEIGHT,
                duration: Config.BLOCK_OUT_DURATION,
                easing: Config.BLOCK_OUT_EASING,
                render(y) {
                    body.position.y = y
                },
                end() {
                    removeBlock(props.id)
                }
            })
        }
    }, [props.dead])

    return (
        <>
            <mesh ref={ref} material={materials.ground}>
                <boxBufferGeometry args={[props.width, Config.BLOCK_HEIGHT, platformDepth]} attach="geometry" />
            </mesh>
            <Coin
                x={0}
                y={props.y}
                z={z}
                dead={props.dead}
            />
        </>
    )
}

export default React.memo(NarrowBlock)