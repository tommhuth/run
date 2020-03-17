
import { useEffect } from "react"
import { useThree } from "react-three-fiber"
import { api, useStore } from "../data/store"
import GameState from "../data/const/GameState"
import animate from "../data/animate"

export default function Camera() {
    let { camera } = useThree() 
    let state = useStore(state => state.data.state)

    useEffect(() => {
        return api.subscribe((position) => { 
            camera.position.z = position.z - 5
            camera.position.y += (position.y + 6 - camera.position.y) * .05
            camera.position.x += (position.x + 5 - camera.position.x) * .05
        }, state => state.data.position)
    }, [])

    useEffect(() => {
        return animate({
            from: { z: 20 },
            to: { z: 35 },
            easing: "easeInOutSine",
            duration: 2000,
            render({ z }) {
                camera.position.z = z
            }
        })
    }, [])

    useEffect(() => {
        if ([  GameState.RUNNING].includes(state)) {
            camera.position.set(5, 6, 25) 
        }
    }, [state])

    useEffect(()=> {
        camera.lookAt(0, 0, 20)  
    }, [])

    return null
}