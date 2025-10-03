import { extend, useFrame } from "@react-three/fiber"
import extensions from "./extensions"
import Camera from "./components/Camera"
import { CannonProvider } from "@data/cannon"
import Lights from "@components/Lights"
import Player from "@components/Player"
import Water from "@components/Water"
import Path from "@components/Path"
import DepthTexture from "@components/DepthTexture"
import { Perf } from "r3f-perf"
import CloudSystem from "@components/CloudSystem"
import Config from "@data/Config"
import SpeedParticles from "@components/SpeedParticles"
import InstancedMesh from "@components/InstancedMesh"
import { useShader } from "@data/hooks"
import { glsl } from "@data/utils"

import noise from "./shaders/noise.glsl"

extend(extensions)

function Foam() {
    let { onBeforeCompile, uniforms } = useShader({
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

                transformed += dir * noise(wp.xyz * vec3(2., 0., 3.2) + uTime * .5) * .125; 
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


export default function App() {
    return (
        <>
            <fogExp2 attach={"fog"} args={["white", .045]} />
            <color args={["white"]} attach={"background"} />

            <CloudSystem />
            <SpeedParticles />
            <Foam />
            <Water />
            <Camera />
            <Lights />

            <CannonProvider >
                <Path />
                <Player />
            </CannonProvider>

            {/* at the very end */}
            <DepthTexture />

            {Config.STATS && <Perf deepAnalyze antialias={false} />}
        </>
    )
} 