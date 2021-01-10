
import React, { useEffect, useRef } from "react"
import { useFrame } from "react-three-fiber"
import { useCannon } from "../../data/cannon"
import { Sphere } from "cannon-es"
import { useStore, api } from "../../data/store"
import materials from "../../shared/materials"
import GameState from "../../data/const/GameState"
import geometry from "../../shared/geometry"

function Enemy({ position, radius, speed, id }) {
    let removeEnemy = useStore(i => i.removeEnemy)
    let state = useStore(i => i.state)
    let end = useStore(i => i.end)
    let { ref, body } = useCannon({
        mass: radius * radius,
        shape: new Sphere(radius),
        onCollide({ body }) {
            if (body.customData?.actor === "player" && state === GameState.RUNNING) {
                end("Dead")
            }
        },
        position
    }, [state])
    let playerZ = useRef(0)

    useEffect(() => {
        return api.subscribe(z => playerZ.current = z, state => state.position.z)
    })

    useFrame(() => {
        body.velocity.z = speed

        if (body.position.y < -75) {
            removeEnemy(id)
        }
    })

    return (
        <mesh
            ref={ref}
            material={materials.enemy}
            geometry={geometry.sphere}
            dispose={null}
            scale={[radius, radius, radius]}
            castShadow 
            receiveShadow 
        />  
    )
}

export default React.memo(Enemy)