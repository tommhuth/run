import { StandardMaterial, Color3 } from "babylonjs"

const plantMaterial = new StandardMaterial()
const baseMaterial = new StandardMaterial()
const redMaterial = new StandardMaterial()
const yellowMaterial = new StandardMaterial()
const blackMaterial = new StandardMaterial()

redMaterial.diffuseColor = Color3.Red()

blackMaterial.diffuseColor = new Color3(.1, .1, .1)

yellowMaterial.diffuseColor = Color3.Yellow()

baseMaterial.diffuseColor = Color3.White()
baseMaterial.roughness = .5

plantMaterial.diffuseColor = new Color3(209/255, 252/255, 241/255)
plantMaterial.roughness = .1

export {
    redMaterial,
    yellowMaterial,
    blackMaterial,
    plantMaterial,
    baseMaterial
}
