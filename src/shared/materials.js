import { MeshPhongMaterial } from "three"
import Color from "../data/const/Color" 


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
        emissiveIntensity: .75,  
        reflectivity: .51,
        flatShading: true
    }),
    obstacle3: new MeshPhongMaterial({
        color: 0x6bd631,
        emissive: 0x6bd631,
        emissiveIntensity: .75, 
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