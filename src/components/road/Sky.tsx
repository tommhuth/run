import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { store } from "@data/store"
import { extractRotation } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import easings from "@src/shaders/easings.glsl"
import { useRef } from "react"
import { Mesh, Vector3 } from "three"

import { ROAD_FORWARD_EDGE } from "./Road"

const forward = new Vector3(0, 0, ROAD_FORWARD_EDGE)

export default function Sky(props) {
    const ref = useRef<Mesh>(null)
    const { onBeforeCompile, uniforms } = useShader({
        shared: glsl`  
			varying vec3 vPosition; 

            ${easings} 
        `,
        vertex: {
            main: glsl`  
                vec3 wPosition = (modelMatrix * vec4(position, 1.0)).xyz;  
 
                vPosition = position;
            `
        },
        fragment: {
            main: glsl`   
                gl_FragColor.rgb = mix(vec3(1.), gl_FragColor.rgb, easeInOutQuad((vPosition.y + 50.) /  60.));
                 
            `
        }
    })

    useFrame(() => {
        const { player } = store.getState()

        if (player.vehicle && ref.current) {
            forward.copy(ref.current.position).setComponent(2, player.vehicle.chassisBody.position.z + ROAD_FORWARD_EDGE)
            ref.current.position.copy(forward)
            ref.current.rotation.y = extractRotation(player.vehicle.chassisBody.quaternion).y
        }
    })

    return (
        <mesh
            ref={ref}
            position-y={50}
        >
            <boxGeometry args={[1000, 100, 1]} />
            <meshBasicMaterial
                onBeforeCompile={onBeforeCompile}
                color={"#c1e5f8"}
                fog={false}
            />
        </mesh>
    )
}
