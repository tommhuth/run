
import React, { useEffect } from "react"
import { useCannon } from "../../data/cannon"
import Config from "../../Config"
import { Vec3, Box } from "cannon"
import uuid from "uuid"
import materials from "../../shared/materials"
import animate from "../../data/animate"
import { useStore } from "../../data/store"
import Block from "../Block"
import BlockType from "../../data/const/BlockType"



function NarrowBlock(props) {
    let platformDepth = 5
    let y = props.previousType === BlockType.NARROW ? props.start + platformDepth / 2 : props.start + props.depth / 2
    let { ref, body } = useCannon({
        mass: 0,
        rotation: [],
        shape: new Box(
            new Vec3(props.width / 2, Config.BLOCK_HEIGHT / 2, platformDepth / 2)
        ),
        position: [
            0,
            -Config.BLOCK_HEIGHT,
            y
        ]
    })
    let removeBlock = useStore(i => i.removeBlock)

    useEffect(() => {
        return animate({
            from: { y: body.position.y },
            to: { y: -Config.BLOCK_HEIGHT / 2 + props.y },
            duration: 1500,
            easing: "spring(1, 80, 10, 0)",
            render({ y }) {
                body.position.y = y
            }
        })
    }, [])

    useEffect(() => {
        if (props.dead) {
            return animate({
                from: { y: body.position.y },
                to: { y: -Config.BLOCK_HEIGHT },
                easing: "easeInCubic",
                duration: 700,
                render({ y }) {
                    body.position.y = y
                },
                complete() {
                    removeBlock(props.id)
                }
            })
        }
    }, [props.dead])

    return (
        <>
            <mesh ref={ref} material={materials.ground} >
                <boxBufferGeometry args={[props.width, Config.BLOCK_HEIGHT, platformDepth]} attach="geometry" />
            </mesh>
        </>
    )
}

export default React.memo(NarrowBlock)