import React, { useEffect, useLayoutEffect } from "react"
import { useCannon } from "../data/cannon"
import materials from "../shared/materials"
import { Sphere } from "cannon-es"
import animate from "@huth/animate"
import Config from "../Config"
import { SphereBufferGeometry } from "three"
import random from "@huth/random"

let geometry = new SphereBufferGeometry(1, 18, 14)

function Obstacle({ dead, radius, position, block }) {
    let { ref, body } = useCannon({
        shape: new Sphere(radius),
        mass: 0,
        position: [
            position[0],
            block.y - 20,
            position[2] + block.start + block.depth / 2
        ]
    }) 

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.visible = false
        }
    }, [])

    useEffect(() => {
        let duration = random.integer(100, 400)

        return animate({
            from: body.position.y,
            to: block.y,
            duration: duration + 200,
            easing: "easeOutQuart",
            delay: block.initial ? 0 : Config.BLOCK_IN_DURATION + duration,
            start() {
                if (ref.current) {
                    ref.current.visible = true
                }
            },
            render(y) {
                body.position.y = y
            },
        })
    }, [])

    useEffect(() => {
        if (dead) {
            return animate({
                from: body.position.y,
                to: body.position.y - 50,
                easing: "easeInCubic",
                duration: 600,
                render(y) {
                    body.position.y = y
                }
            })
        }
    }, [dead])

    return (
        <mesh
            ref={ref}
            material={materials.ground}
            geometry={geometry}
            castShadow
            receiveShadow
            dispose={null}
            scale={[radius, radius, radius]}
        />
    )
}

export default React.memo(Obstacle)