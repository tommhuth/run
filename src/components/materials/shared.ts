import carMap from "@assets/textures/car.png"
import storageMap from "@assets/textures/storage.png"
import { DoubleSide, MeshBasicMaterial, MeshPhongMaterial, SRGBColorSpace, TextureLoader } from "three"

export const floorMaterial = new MeshPhongMaterial({
    name: "floor",
    color: "#bcc7d3",
    dithering: true
})

export const leafMaterial = new MeshPhongMaterial({
    name: "leaf",
    color: "#bcc7d3",
    dithering: true,
    side: DoubleSide
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

export const whiteMaterial = new MeshBasicMaterial({
    color: "#fff",
    name: "white",
    toneMapped: false
})

const carTexture = new TextureLoader().load(carMap)

carTexture.colorSpace = SRGBColorSpace
carTexture.flipY = false

const storageTexture = new TextureLoader().load(storageMap)

storageTexture.colorSpace = SRGBColorSpace
storageTexture.flipY = false

export const carMaterial = new MeshPhongMaterial({
    name: "car",
    map: carTexture,
    color: "white",
})

export const storageMaterial = new MeshPhongMaterial({
    name: "storage",
    map: storageTexture,
    color: "white",
})
