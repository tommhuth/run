import { MeshPhongMaterial, MeshBasicMaterial } from "three"

export default {
    gray: new MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
        shininess: 5,
        emissive: 0x009dff,
        emissiveIntensity: .0
    }),
    white: new MeshBasicMaterial({ color: 0xffffff })
}