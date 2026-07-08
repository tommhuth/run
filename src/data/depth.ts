import { Layers } from "three"

export const DEPTH_IGNORE_LAYER = 1
export const depthIgnoreLayers = new Layers()

depthIgnoreLayers.set(DEPTH_IGNORE_LAYER)
