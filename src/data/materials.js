import { MeshStandardMaterial, MeshBasicMaterial } from "three"

export default {
    red: new MeshStandardMaterial({ color: 0xff2e5b, roughness: 2 }),
    white: new MeshBasicMaterial({ color: 0xFFFFFF })
}