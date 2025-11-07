import m from "@assets/textures/car.png"
import { MeshPhongMaterial, SRGBColorSpace, TextureLoader } from "three"

export const floorMaterial = new MeshPhongMaterial({
    name: "floor",
    color: "#bcc7d3",
    dithering: true
})

export const rockMaterial = new MeshPhongMaterial({
    color: "#bcc7d3",
    name: "rock",
    dithering: true
})

export const treeMaterial = new MeshPhongMaterial({
    color: "#fff",
    name: "tree",
    dithering: true
})

export const streetLightMaterial = new MeshPhongMaterial({
    color: "#fff",
    name: "streetlight",
    dithering: true
})

const map = new TextureLoader().load(m)

map.colorSpace = SRGBColorSpace
map.flipY = false

export const carMaterial = new MeshPhongMaterial({
    name: "car",
    map,
    color: "white",
})
