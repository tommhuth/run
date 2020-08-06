import { MeshLambertMaterial, MeshPhongMaterial } from "three"


export default {
    ground: new MeshPhongMaterial({
        shininess: .1,
        flatShading: true,
        color: 0x94e344,
        emissive: 0x94e344,
        emissiveIntensity: .5
    }),
    enemy: new MeshPhongMaterial({
        color: 0x46878f,
        emissive: 0x46878f,
        emissiveIntensity: .5, 
        flatShading: true
    }),
    obstacle :new MeshPhongMaterial({
        color: 0x78db21, 
        flatShading: true
    }),
    player :new MeshPhongMaterial({
        color: 0xe2f3e4, 
        emissive: 0xe2f3e4, 
        emissiveIntensity: 1, 
        flatShading: true
    }),
}