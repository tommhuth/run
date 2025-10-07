import { useShader } from "@data/hooks"
import { store } from "@data/store"
import { glsl } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import { useLayoutEffect, useRef } from "react"
import { Mesh } from "three"

export const waterDeepColor = "darkblue"

export default function Water({ size = 100 }: { size?: number }) {
    const ref = useRef<Mesh>(null)
    const { onBeforeCompile } = useShader({
        uniforms: {
        },
        shared: glsl`  
            varying vec3 worldPos;  
            varying vec3 pos;  
        `,
        vertex: {
            main: glsl`  
                worldPos =  (modelMatrix * vec4(position, 1.0)).xyz;
                pos = position;
            `
        },
        fragment: {
            main: glsl`
               gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.),  pow(clamp( (pos.y - 200. ) / 50., 0., 1.), 2. ) );
            `
        }
    })

    useLayoutEffect(() => {
        if (!ref.current) {
            return
        }

        ref.current.position.z = size * .4
    }, [])

    useFrame(() => {
        const { player, state } = store.getState()

        if (!ref.current || !player.mesh || state !== "running") {
            return
        }

        ref.current.position.z = player.mesh.position.z + size * .4
    })

    return (
        <group ref={ref}>
            <mesh
                position={[
                    0,
                    -500 * .5 - 4.5,
                    size * .5 - .5
                ]}
            >
                <boxGeometry args={[500, 500, 1]} />
                <meshPhongMaterial
                    onBeforeCompile={onBeforeCompile}
                    color={waterDeepColor}
                    fog={false}
                    name="waterbackground"
                />
            </mesh>
            <mesh
                position-y={-4.5}
                receiveShadow
                renderOrder={-1}
            >
                <planeGeometry
                    onUpdate={e => {
                        e.rotateY(Math.PI * .5)
                        e.rotateX(Math.PI * .5)
                    }}
                    args={[size, size * 2]}
                />
                <meshPhongMaterial
                    attach="material"
                    color={"#009163"}
                    transparent
                    opacity={.4}
                    name="water"
                />
            </mesh>
        </group>
    )
}
