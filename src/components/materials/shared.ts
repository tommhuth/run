import carMap from "@assets/textures/car.png"
import { DoubleSide, MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial, SRGBColorSpace, TextureLoader } from "three"

export const leafMaterial = new MeshLambertMaterial({
    name: "leaf",
    color: "#ebf0f5",
    dithering: true,
    side: DoubleSide
})

export const bulbMaterial = new MeshBasicMaterial({
    color: "#fff",
    toneMapped: false
})

const carTexture = new TextureLoader().load(carMap)

carTexture.colorSpace = SRGBColorSpace
carTexture.flipY = false

export const carMaterial = new MeshPhongMaterial({
    name: "car",
    map: carTexture,
    color: "white",
})
