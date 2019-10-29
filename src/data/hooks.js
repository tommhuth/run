import { useState } from "react"
import random from "./random"

export function useRandomVector(min, max) {
    let [position, setPosition] = useState(() => {
        return [
            random.integer(min[0], max[0]),
            random.integer(min[1], max[1]),
            random.integer(min[2], max[2])
        ]
    })

    return [position, setPosition]
}