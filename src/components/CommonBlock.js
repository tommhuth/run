
import React, { useEffect } from "react"
import { useStore } from "../data/store"
import { useCannon } from "../data/cannon"
import Config from "../Config"
import { Vec3, Box } from "cannon" 
import materials from "../shared/materials"
import animate from "../data/animate"

export function CommonBlock(props) {
    let { ref, body } = useCannon({
        mass: 0,
        rotation: [],
        shape: new Box(
            new Vec3(props.width / 2, Config.BLOCK_HEIGHT / 2, props.depth / 2)
        ),
        position: [
            0,
            -Config.BLOCK_HEIGHT,
            props.start + props.depth / 2
        ]
    })
    let removeBlock = useStore(i => i.removeBlock)

    useEffect(() => {
        return animate({
            from: { y: body.position.y },
            to: { y: -Config.BLOCK_HEIGHT / 2 + props.y },
            duration: Config.BLOCK_IN_DURATION,
            easing: Config.BLOCK_IN_EASING,
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
                easing: Config.BLOCK_OUT_EASING,
                duration: Config.BLOCK_OUT_DURATION,
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
            {props.children ? React.cloneElement(props.children, {
                ...props,
            }) : null}
            <mesh
                ref={ref}
                material={materials.ground}
            >
                <boxBufferGeometry args={[props.width, Config.BLOCK_HEIGHT, props.depth]} attach="geometry" />
            </mesh>
        </>
    )
}

export default React.memo(CommonBlock)