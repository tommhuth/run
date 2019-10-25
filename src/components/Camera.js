import { useEffect } from "react"
import { useThree } from "react-three-fiber"
import { api } from "../data/store"

export default function Camera() {
    let { camera } = useThree()

    useEffect(() => {
        camera.position.set(0, 5, 2)
        camera.lookAt(0, 0, 13) 

        return api.subscribe(
            (position) => { 
                camera.position.z = position.z - 6  
            },
            state => state.data.position
        )
    }, [camera])

    return null
}