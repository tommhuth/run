import { MeshPhongMaterial, MeshBasicMaterial } from "three"

export default {
    red: new MeshPhongMaterial({ color: 0xff2e5b, flatShading:true, shininess: 5, emissive: 0xff2e5b, emissiveIntensity: 0 }), //new MeshStandardMaterial({ color: 0xff2e5b, roughness: 2, emissive:0xff2e5b, emissiveIntensity:.1 }),
    white: new MeshBasicMaterial({ color: 0xFFFFFF })
}