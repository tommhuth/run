import carMap from "@assets/textures/car.png"
import { DoubleSide, MeshLambertMaterial, MeshPhongMaterial, SRGBColorSpace, TextureLoader } from "three"

export const leafMaterial = new MeshLambertMaterial({
    name: "leaf",
    color: "#ebf0f5",
    dithering: true,
    side: DoubleSide
})

export const rockMaterial = new MeshLambertMaterial({
    color: "#8c9fb4",
    name: "rock",
    dithering: true
})

export const treeMaterial = new MeshLambertMaterial({
    color: "#fff",
    name: "tree",
    dithering: true
})

export const streetLightMaterial = new MeshLambertMaterial({
    color: "#86a7cf",
    name: "streetlight",
    dithering: true
})

const carTexture = new TextureLoader().load(carMap)

carTexture.colorSpace = SRGBColorSpace
carTexture.flipY = false

export const carMaterial = new MeshPhongMaterial({
    name: "car",
    map: carTexture,
    color: "white",
})
