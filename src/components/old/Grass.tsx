import model from "@assets/models/grass.glb"
import model2 from "@assets/models/grass2.glb"
import { glsl } from "@components/materials/helpers"
import { useShader } from "@components/materials/useShader"
import { useGLTF } from "@react-three/drei"
import easings from "@src/shaders/easings.glsl"
import { DoubleSide } from "three"

export default function Grass({ side, ...props }) {
    const left = useGLTF(model)
    const right = useGLTF(model2)
    const { onBeforeCompile, uniforms } = useShader({
        shared: glsl`  
			varying vec3 vWorldPosition; 

            ${easings} 
        `,
        vertex: {
            main: glsl`  
                vec3 wPosition = (modelMatrix * vec4(position, 1.0)).xyz; 
                transformed.y *=  easeInOutCubic(clamp((abs(wPosition.x ) - 14.) / 16., 0., 1.)) * 1.25 + .1;

                vWorldPosition = wPosition;
            `
        },
        fragment: {
            main: glsl`  
                // gl_FragColor.a = mix(vec3(1.), vec3(0., 1., 1.), vWorldPosition.y /  1.75);
                gl_FragColor.a =   vWorldPosition.y /  .75;
            `
        }
    })
    const geo = side === "left" ? left.nodes.grass.geometry : right.nodes.grass2.geometry

    return (
        <group
            {...props}
            dispose={null}
            visible={false}
        >
            <mesh
                receiveShadow={side === "left"}
                geometry={geo}
                position={[3, 0, 0]}
            >
                <meshPhongMaterial
                    onBeforeCompile={onBeforeCompile}
                    color={"#13fbc1"}
                    side={DoubleSide}
                    transparent
                />
            </mesh>
            <mesh
                receiveShadow={side === "left"}
                geometry={geo}
                position={[-3, 0, 0]}
            >
                <meshPhongMaterial
                    onBeforeCompile={onBeforeCompile}
                    color={"#13fbc1"}
                    side={DoubleSide}
                    transparent
                />
            </mesh>
        </group>
    )
}
