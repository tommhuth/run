import React, { useEffect, useState } from "react"
import Config from "../data/Config"
import { Canvas, useThree, useFrame } from "react-three-fiber"
import { DoubleSide, MeshPhongMaterial, SphereBufferGeometry } from "three"
import { useStore, api } from "../data/store"
import { Box, Vec3, Sphere, Body, Plane } from "cannon"
import { useCannon, useWorld } from "../data/cannon"
import random from "../data/random"

let mat = {
    red: new MeshPhongMaterial({ color: 0xff0000, flatShading: true }),
    blue: new MeshPhongMaterial({ color: 0x00d5ff, flatShading: true, shininess: 5 }),
    white: new MeshPhongMaterial({ color: 0xffffff, flatShading: true, side: DoubleSide }),
}
let geo = {
    sphere: new SphereBufferGeometry(1, 8, 8)
}


export default function Path() {
    let blocks = useStore(state => state.data.blocks)
    let actions = useStore(state => state.actions)
    let world = useWorld()
    let limit = 35

    useEffect(() => {
        let edges = []

        for (let direction of [1, -1]) {
            let edge = new Body({
                shape: new Plane(),
                position: new Vec3(limit * direction, 0, 0),
                collisionFilterGroup: 8,
                collisionFilterMask: 2,
                mass: 0,
            })

            edge.addEventListener("collide", ({ body }) => {
                body.velocity.x = 0
                body.torque.set(0, 0, 0)
                body.force.set(0, 0, 0)
                body.angularVelocity.set(0, 0, 0)
            })

            edge.quaternion.setFromAxisAngle(new Vec3(0, 1, 0), Math.PI / 2 * -direction)
            world.add(edge)
        }

        return () => {
            edges.forEach(edge => world.remove(edge))
        }
    }, [])

    useEffect(() => {
        let id = setInterval(() => actions.generatePath(), 1000)

        return () => clearInterval(id)
    }, [])

    return (
        <>
            {blocks.map(i => {
                return <Block {...i} key={i.id} />
            })}
        </>
    )
}

function Enemy({ x, y, z, velocityX, triggerZ, radius }) {
    let [active, setActive] = useState(false)
    let [velocityZ] = useState(random.real(-1, 1))
    let { ref, body } = useCannon({
        shape: new Sphere(radius),
        active,
        collisionFilterGroup: 4,
        collisionFilterMask: 1 | 2 | 4,
        mass: radius * radius * radius,
        position: [x, y + radius, z]
    })

    useFrame(() => {
        body.velocity.x = velocityX
        body.velocity.z = velocityZ
    })

    useEffect(() => {
        let unsubscribe = api.subscribe((position) => {
            if (triggerZ < position.z) {
                if (!active) {
                    setActive(true)
                    unsubscribe()
                }
            } else {
                if (active) {
                    setActive(false)
                }
            }
        }, state => state.data.position)

        return unsubscribe
    }, [active])

    return (
        <mesh
            scale={[radius, radius, radius]}
            geometry={geo.sphere}
            ref={ref}
            material={mat.blue}
            dispose={null}
        />

    )
}

function Block({
    depth,
    start,
    end,
    active: defaultActive = false,
    y
}) {
    let [active, setActive] = useState(defaultActive)
    let { ref } = useCannon({
        shape: new Box(new Vec3(50, 2, depth / 2)),
        active,
        collisionFilterGroup: 6,
        collisionFilterMask: 1 | 2 | 4,
        position: [0, y - 2, start + depth / 2]
    })
    let [obstacles] = useState(() => {
        let count = random.integer(0, 5)
        let result = []

        for (let i = 0; i < count; i++) {
            let radius = random.integer(depth * .25, depth * .40)

            result.push({
                radius,
                z: random.real(start + radius, start + depth - radius),
                y: y  ,
                x: random.integer(-20, 20)
            })
        }

        return result
    })
    let [enemies] = useState(() => {
        let result = []
        let count = obstacles.length === 0 ? random.integer(1, depth * .25) : 0
        let maxVelocity = 20

        for (let i = 0; i < count; i++) {
            let border = 40 + random.integer(0, 5)
            let radius = random.integer(1, 5)
            let x = random.pick([border, -border])
            let velocityX = (1 - (radius / (1 + 5))) * maxVelocity * -x / border
            let z = start + random.integer(2, depth - 2)

            result.push({
                x,
                y: y + 2,
                radius,
                z,
                velocityX,
                triggerZ: z - Math.abs(velocityX * 1.5)
            })
        }

        return result
    })

    useEffect(() => {
        return api.subscribe(({ z }) => {
            if (z > start - 20 && z < end + 20) {
                if (!active) {
                    setActive(true)
                }
            } else {
                if (active) {
                    setActive(false)
                }
            }
        }, state => state.data.position)
    }, [active])

    return (
        <>
            <mesh material={mat.blue} ref={ref}>
                <boxBufferGeometry attach="geometry" args={[200, 4, depth]} />
            </mesh>

            {obstacles.map((props, index) => <Obstacle active={active} key={index} {...props} />)}
            {enemies.map((props, index) => <Enemy active={active} key={index} {...props} />)}
        </>
    )
}
  

function Obstacle({
    radius = 4,
    x,
    y,
    active = false,
    z
}) {
    let { ref, body } = useCannon({
        shape: new Sphere(radius),
        collisionFilterGroup: 1,
        collisionFilterMask: 1 | 2 | 4,
        active,
        position: [x, y, z]
    })

    useEffect(() => {
        let axis = new Vec3(...random.pick([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]))
        let angle = random.real(0, Math.PI * 2)

        body.quaternion.setFromAxisAngle(axis, angle)
    }, [body])

    return (
        <mesh
            scale={[radius, radius, radius]}
            geometry={geo.sphere}
            ref={ref}
            material={mat.blue}
            dispose={null}
        />
    )
}