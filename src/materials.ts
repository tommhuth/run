import ConcreteMaterial from "@components/ConcreteMaterial"
import { MeshBasicMaterial } from "three"

export const gray = new ConcreteMaterial({ name: "gray" })

export const white = new MeshBasicMaterial({ color: "#fff", name: "white" })