import { MeshLambertMaterial, MeshPhongMaterial, CubeTextureLoader, EquirectangularReflectionMapping, TextureLoader } from "three"
import Color from "../data/const/Color"

var envMap = new TextureLoader().load("ref.png")

let cb = new CubeTextureLoader()

let e = cb.load([
    "skyrender0001.png", "skyrender0004.png",
    "skyrender0003.png", "skyrender0003.png",
    "skyrender0005.png", "skyrender0002.png"
])



envMap.mapping = EquirectangularReflectionMapping


export default {
    ground: new MeshPhongMaterial({
        shininess: 5, 
        color: Color.BLUE,    
        flatShading: true
    }),
    enemy: new MeshPhongMaterial({
        color: 0x72DDC8,
        emissive: 0x72DDC8,
        emissiveIntensity: .75, 
        reflectivity: .5,
        flatShading: true
    }),
    obstacle: new MeshPhongMaterial({
        color: Color.BLUE,
        emissive: Color.BLUE,
        shininess: 6,
        //emissiveIntensity: .75,  
        reflectivity: 1,
        flatShading: true
    }),
    obstacle2: new MeshPhongMaterial({
        color: 0x71d13d,
        emissive: 0x71d13d,
        emissiveIntensity: .75, envMap,
        reflectivity: .51,
        flatShading: true
    }),
    obstacle3: new MeshPhongMaterial({
        color: 0x6bd631,
        emissive: 0x6bd631,
        emissiveIntensity: .75, envMap,
        reflectivity: .51,
        flatShading: true
    }),
    player: new MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1,
        flatShading: true
    }),
}