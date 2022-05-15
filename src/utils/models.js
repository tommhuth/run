import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import noise from "../utils/shaders/noise.glsl"
import { useStore } from "../data/store" 
import { glsl } from "./utils"
import { useShader } from "./hooks"

const context = createContext()

export function useModels(type) {
    return useContext(context)[type]
}

let ids = { box: 0, sphere: 0 }

export function useInstancedMesh(type) {
    let instance = useModels(type)
    let [id, setId] = useState()

    useEffect(() => {
        setId(++ids[type])
    }, [type])

    return [instance, id % instance?.count]
}


export function ModelsProvider({ children }) {
    let [boxRef, setBoxRef] = useState()
    let playerPosition = useRef([0, 0, 0])
    let [sphereRef, setSphereRef] = useState()
    let [material, uniforms] = useShader({
        color: "purple",
        uniforms: {
            time: 0,
            playerPosition: [0, 0, 0],
            radius: .75 * 1.25,
        },
        vertex: {
            pre: glsl` 
                uniform float time;   
                uniform float radius;   
                uniform vec3 playerPosition;   
                varying vec3 vPosition;   
            `,
            main: glsl` 
                vec4 worldPos = instanceMatrix *  vec4(position, 1.);
                
                worldPos = modelMatrix * worldPos; 
                vPosition = worldPos.xyz;
            `
        },
        fragment: {
            pre: glsl`  
                varying vec3 vPosition;
                uniform vec3 playerPosition;   
                uniform float time;
                uniform float radius;

                float easeInOutQuart(float x) {
                    return x < .5 ? 8. * x * x * x * x : 1. - pow(-2. * x + 2., 4.) / 2.;
                    }

                float easeInOutQuad(float x) {
                    return x < 0.5 ? 2. * x * x : 1. - pow(-2. * x + 2., 2.) / 2.;
                }

                ${noise}
            `,
            main: glsl`  
                vec3 finput = vec3(vPosition.x * .1 + time  , vPosition.y * .1, vPosition.z * .1 + time );
                vec4 fogColor = vec4(1./255., 0., 186./255., 1.); // 232, 0, 186
                float noise = noise(finput  ) + .2;
                vec4 baseColor = vec4(gl_FragColor);
                float yfade = easeInOutQuad(1. - clamp((vPosition.y + 15.)/25., 0., 1.));

                vec3 center = vec3(playerPosition.x, min(vPosition.y,playerPosition.y ), playerPosition.z);
                float dist =(1. - clamp(distance(center, vPosition) / radius, .0, 1.));
                float strength = 1. - clamp(distance(playerPosition, vPosition) / 6., 0., 1.);

                // gl_FragColor = (baseColor + fogColor * yfade) - dist * strength * vec4(.35, .35, .35, 1.);
 

                gl_FragColor = mix(baseColor, fogColor, yfade - noise * .82) + 
                    (fogColor * yfade) - 
                    vec4(.2, .2, .2, .0) * dist * strength; 
            `
        }
    })

    useEffect(() => {
        return useStore.subscribe(i => playerPosition.current = i, state => state.player.position)
    }, [])

    useFrame(() => {
        uniforms.time.value += .0025
        uniforms.time.needsUpdate = true
        uniforms.playerPosition.value = playerPosition.current
        uniforms.playerPosition.needsUpdate = true
    })

    return (
        <context.Provider value={{ box: boxRef, sphere: sphereRef }}>
            <instancedMesh
                ref={setBoxRef} 
                args={[undefined, material, 40]}
            >
                <boxBufferGeometry args={[1, 1, 1, 1, 1, 1]} />
            </instancedMesh>

            <instancedMesh
                ref={setSphereRef}
                receiveShadow
                args={[undefined, undefined, 20]} 
            >
                <sphereBufferGeometry args={[1, 16, 16]} />
                <meshPhongMaterial color="gray" />
            </instancedMesh>
            {children}
        </context.Provider>
    )
}