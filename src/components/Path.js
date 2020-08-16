
import React, { useEffect } from "react"
import { useThree, useFrame } from "react-three-fiber"
import Block from "./Block"
import { useStore } from "../data/store"
import Enemy from "./actors/Enemy"
import GameState from "../data/const/GameState"

export default function Path() {
    let blocks = useStore(i => i.blocks)
    let enemies = useStore(i => i.enemies)
    let state = useStore(i => i.state)
    let maintainPath = useStore(i => i.maintainPath)

    useEffect(() => {
        if (state === GameState.RUNNING) {
            let maintain = () => setInterval(maintainPath, 500)
            let id = maintain()
            let listener = () => {
                if (document.visibilityState === "hidden") {
                    clearInterval(id)
                } else {
                    id = maintain()
                }
            }

            document.addEventListener("visibilitychange", listener)

            return () => {
                clearInterval(id)
                document.removeEventListener("visibilitychange", listener)
            }
        }
    }, [state])

    return (
        <>
            {enemies.map(i => <Enemy {...i} key={i.id} />)}
            {blocks.map(i => (
                <Block  {...i} key={i.id} />
            ))}
        </>
    )
}
