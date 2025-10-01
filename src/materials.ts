import ConcreteMaterial from "@components/ConcreteMaterial"
import { MeshBasicMaterial } from "three"

export const gray = new ConcreteMaterial({ name: "red", shininess: 100, wireframe: false })

export const white = new MeshBasicMaterial({ color: "#fff", name: "white" })