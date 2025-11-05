import { MeshBasicMaterial, MeshPhongMaterial } from "three"

export const ball = new MeshPhongMaterial({
    name: "ball",
    emissive: "#fff",
    emissiveIntensity: .5,
    shininess: 100,
    color: "#fff"
})

export const white = new MeshBasicMaterial({
    color: "#fff", name: "white"
})
