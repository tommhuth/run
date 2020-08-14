import { MeshPhongMaterial } from "three"
import Color from "../data/const/Color" 


export default {
    ground: new MeshPhongMaterial({
        shininess: 5, 
        color: Color.BLUE,    
        flatShading: true
    }),
    obstacle: new MeshPhongMaterial({
        color: Color.BLUE, 
        shininess: 5,  
        flatShading: true
    }),
    enemy: new MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: .5,  
        flatShading: true
    }),
    player: new MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1,
        flatShading: true
    }),
}