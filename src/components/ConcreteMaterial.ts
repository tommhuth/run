import { glsl } from "@data/utils"
import { extend } from "@react-three/fiber"
import { Color, IUniform, MeshPhongMaterial } from "three"
import { PatchedPhongMaterial } from "./PatchedMaterial"
import { deepcolor } from "./Water"

interface ConcreteMaterialUniforms {
    uTime: IUniform<number>;
}

export default class ConcreteMaterial extends PatchedPhongMaterial<ConcreteMaterialUniforms> {
    uniforms = {
        uTime: {
            value: 0
        },
        uFogColor: {
            value: new Color(deepcolor)
        }
    }
    shader = {
        shared: glsl`
            uniform float uTime;
            uniform vec3 uFogColor;
            varying vec3 worldPosition;
            varying vec2 vUv;

            float sinNoise(float x) {
                return 0.5 + 0.5 * (sin(x) * 0.1 + sin(x * 2.1) * 0.125 + sin(x * 2.2) * 0.125);
            }

            float random(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
            }
        `,
        vertex: {
            main: glsl`
                worldPosition = (modelMatrix * vec4(position, 1.)).xyz;
                vUv = uv;
            `
        },
        fragment: {
            main: glsl`  
                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    uFogColor, 
                    smoothstep(0., 1., clamp((worldPosition.y - 1.) / -10., 0., 1.))  
                );  

                gl_FragColor.rgb = mix(
                    gl_FragColor.rgb, 
                    vec3(1.), 
                    vUv.x * .75 * clamp((worldPosition.y + 4.5) / 1., 0., 1.)
                );
            `,
        }
    }

    constructor(...props: ConstructorParameters<typeof MeshPhongMaterial>) {
        super(...props)
        this.initialize()
    }

    update(delta: number) {
        this.uniforms.uTime.value += delta
    }
}

extend({ ConcreteMaterial })