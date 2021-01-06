import { MeshPhongMaterial, MeshLambertMaterial } from "three"
import Color from "../data/const/Color"
import fogParsVert from "./fog_pars_vertex.glsl"
import fogVert from "./fog_vertex.glsl"
import fogParsFrag from "./fog_pars_frag.glsl"
import fogFrag from "./fog_frag.glsl"

let ground = new MeshPhongMaterial({
    shininess: 3,
    color: Color.BLUE,
    flatShading: false,
})

ground.onBeforeCompile = shader => { 
    shader.vertexShader = shader.vertexShader.replace("#include <fog_pars_vertex>", fogParsVert)
    shader.vertexShader = shader.vertexShader.replace("#include <fog_vertex>", fogVert)
    shader.fragmentShader = shader.fragmentShader.replace("#include <fog_pars_fragment>", fogParsFrag)
    shader.fragmentShader = shader.fragmentShader.replace("#include <fog_fragment>", fogFrag)
}


export default {
    ground,
    obstacle: new MeshPhongMaterial({
        color: Color.BLUE,
        shininess: 5,
        flatShading: false
    }),
    enemy: new MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: .5,
        flatShading: true
    }),
    sign: new MeshPhongMaterial({
        shininess: 30,
        color: Color.DARK_BLUE,
        flatShading: true
    }),
    player: new MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1,
        flatShading: true
    }),
}