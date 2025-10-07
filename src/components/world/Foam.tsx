
import InstancedMesh from "@components/InstancedMesh"
import { useShader } from "@data/hooks"
import { glsl } from "@data/utils"
import { useFrame } from "@react-three/fiber"
import noise from "@src/shaders/noise.glsl"

export default function Foam() {
    const { onBeforeCompile, uniforms } = useShader({
        uniforms: {
            uTime: {
                value: 0
            }
        },
        shared: glsl`
            uniform float uTime;
        `,
        vertex: {
            head: glsl`
                ${noise}

                vec3 getScale(mat4 m) {
                    return vec3(
                        length(m[0].xyz), // X axis scale
                        length(m[1].xyz), // Y axis scale
                        length(m[2].xyz)  // Z axis scale
                    );
                }
            `,
            main: glsl` 
                vec4 wp = modelMatrix * vec4(transformed, 1.);
                vec3 dir = normalize(transformed.xyz);

                dir.y = 0.;

                transformed += dir * noise(wp.xyz * vec3(2., 0., 3.2) + uTime * .5) * .1; 
            `
        }
    })

    useFrame((state, delta) => {
        uniforms.uTime.value += delta
    })

    return (
        <>
            <InstancedMesh
                name="circle"
                count={150}
            >
                <meshBasicMaterial
                    onBeforeCompile={onBeforeCompile}
                    color="white"
                />
                <cylinderGeometry args={[.5, .5, .01, 7, 1]} />
            </InstancedMesh>
            <InstancedMesh
                name="box"
                count={50}
            >
                <meshBasicMaterial
                    onBeforeCompile={onBeforeCompile}
                    color="white"
                />
                <boxGeometry args={[1, .01, 1, 4, 1, 4]} />
            </InstancedMesh>
        </>
    )
}
