import { Vec3, Box as CannonBox } from "cannon-es"
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react"
import { useInstancedBody } from "../utils/cannon"
import { useInstancedMesh } from "../utils/models"
import animate from "@huth/animate"

export default forwardRef(({
    fixed = false,
    width = 1,
    height = 1,
    depth = 1,
    mass = width * height * depth,
    color,
    x = 0,
    y = 0,
    z = 0,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    noanim = false
}, ref) => {
    let [instance, id] = useInstancedMesh("box")
    let definition = useMemo(() => {
        return new CannonBox(new Vec3(width / 2, height / 2, depth / 2))
    }, [width, height, depth])
    let [body] = useInstancedBody({
        mass,
        color,
        instance,
        id,
        fixed,
        position: [x, noanim ? y : y - 20, z],
        rotation: [rotationX, rotationY, rotationZ],
        scale: [width, height, depth],
        definition
    })

    useEffect(() => {
        if (noanim) {
            return 
        }

        return animate({
            from: body.position.y,
            to: y,
            easing: "easeOutCubic",
            render(y) {
                body.position.y = y
            }
        })
    }, [y, body, noanim])

    useImperativeHandle(ref, () => {
        return {
            body,
            instance,
            id
        }
    }, [body, instance, id])

    return null
})