import { memo, useEffect, useMemo, useRef, useState } from "react"
import { useBody } from "../utils/cannon"
import GameState from "../data/const/GameState"
import { end, setPlayerPosition, useStore } from "../data/store"
import { Sphere as SphereShape } from "cannon-es"
import { useFrame } from "@react-three/fiber"
import Config from "../Config"
import { clamp, glsl, ndelta } from "../utils/utils"
import noise from "../utils/shaders/noise.glsl"
import { useShader } from "../utils/hooks"
import { Color, MeshLambertMaterial } from "three"

function Player({ radius = .75 }) {
    let shape = useMemo(() => {
        return new SphereShape(radius)
    }, [radius])
    let hasDeviceOrientation = useStore(i => i.hasDeviceOrientation)
    let xSpeed = useRef(0)
    let [ready, setReady] = useState(false)
    let lastBlock = useStore(i => {
        return i.blocks.reduce((min, curr) => Math.min(min, curr.y), i.blocks[i.blocks.length - 1].y)
    })
    let [ref, body] = useBody({
        mass: 1,
        position: [0, 5, 10],
        linearDamping: .2,
        definition: shape,
        allowSleep: false
    })
    let state = useStore(i => i.state)
    let [material, uniforms] = useShader({
        uniforms: {
            time: 0,
            base: MeshLambertMaterial,
            playerPosition: 0, 
        },
        vertex: {
            pre: glsl` 
                varying vec3 vPosition; 
                uniform float time;     
            `,
            main: glsl` 
                vec4 worldPos = vec4(position, 1.);
                
                worldPos = modelMatrix * worldPos; 
                vPosition = worldPos.xyz;
            `
        },
        fragment: {
            pre: glsl`  
                varying vec3 vPosition;
                uniform float time;

                ${noise}
            `,
            main: glsl`  
                vec4 fogColor = vec4(1./255., 0., 186./255., 1.);
                float noise = noise(vPosition * .1 ) + .2;
                vec4 baseColor = vec4(gl_FragColor);
                float yfade = 1. - clamp((vPosition.y + 20.)/35., 0., 1.);

                gl_FragColor = mix(baseColor, fogColor, yfade - noise * .2) + (fogColor * yfade) + vec4(.3, .3, .3, 1.);
            `
        }
    })

    useFrame(() => {
        uniforms.time.value += .0025
        uniforms.time.needsUpdate = true
    })

    // ready
    useEffect(() => {
        if (state === GameState.RUNNING) {
            let id = setTimeout(() => setReady(true), 500)

            return () => {
                clearTimeout(id)
            }
        }
    }, [state])

    // left/right
    useEffect(() => {
        let onMouseMove = (e) => {
            if (state !== GameState.RUNNING) {
                return
            }

            let part = window.innerWidth * .2
            let speed = 10
            let velocity = clamp(((e.clientX - (window.innerWidth / 2)) / (part)), -1, 1)


            xSpeed.current = Math.abs(velocity) ** 2 * Math.sign(velocity) * speed * -1
        }
        let onDeviceOrientation = e => {
            if (state !== GameState.RUNNING) {
                return
            }

            let velocity = -e.gamma / 50 * 24

            body.velocity.x = velocity
        }

        window.addEventListener("mousemove", onMouseMove)

        if (hasDeviceOrientation) {
            window.addEventListener("deviceorientation", onDeviceOrientation)
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("deviceorientation", onDeviceOrientation)
        }
    }, [body, hasDeviceOrientation, state])

    // jump
    useEffect(() => {
        let onClick = () => {
            if (state === GameState.RUNNING) {
                body.velocity.y = 9
            }
        }

        window.addEventListener("click", onClick)

        return () => {
            window.removeEventListener("click", onClick)

        }
    }, [state, body])

    // game over
    useFrame(() => {
        if (state === GameState.RUNNING) {
            let offsideBuffer = Config.BLOCK_MAX_EXTRA_WIDTH / 2
            let x = body.position.x
            let offside = x < -(Config.BLOCK_WIDTH / 2 + offsideBuffer) || x > Config.BLOCK_WIDTH / 2 + offsideBuffer
            let y = body.position.y
            let low = y + 1 < lastBlock
            let minSpeed = 2
            let stalled = body.velocity.z < minSpeed

            if ((stalled && ready) || low || offside) {
                end(stalled && ready ? "Crashed" : "Fell off")
            }
        }
    })

    useFrame((_, delta) => {
        if (state === GameState.RUNNING) {
            body.velocity.z = 600 * ndelta(delta)
        }

        setPlayerPosition(body.position.toArray())
    })

    return (
        <mesh ref={ref} args={[undefined, material]}>
            <sphereBufferGeometry args={[radius, 16, 16]} />
        </mesh>
    )
}

export default memo(Player) 