import ConcreteMaterial from "@components/ConcreteMaterial"
import { MeshBasicMaterial, MeshPhongMaterial } from "three"

export const gray = new ConcreteMaterial({ name: "red", shininess: 100, wireframe: false })
export const ball = new MeshPhongMaterial({ name: "ball", shininess: 100, color: "lightgray" })

export const white = new MeshBasicMaterial({ color: "#fff", name: "white" })