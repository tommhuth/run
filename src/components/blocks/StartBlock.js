
import React, { useEffect, useRef, useMemo } from "react"
import Coin from "../actors/Coin"
import { TextGeometry, Font } from "three"
import materials from "../../shared/materials"
import animate from "../../data/animate"
import oswaldFont from "../../../assets/fonts/oswald.json"

function Text({
    position = [0, 0, 0],
    children,
    index = 0,
    ...rest
}) {
    let geometry = useMemo(() => {
        return new TextGeometry(children, {
            font: new Font(oswaldFont),
            size: 12,
            height: 50,
            curveSegments: 4,
            bevelEnabled: false,
        })
    }, [children])
    let ref = useRef()

    useEffect(() => {
        ref.current.position.x = position[0]
        ref.current.position.z = position[2]
        ref.current.position.y = -100
    }, [])

    useEffect(() => {
        return animate({
            from: { y: -100 },
            to: { y: -50 },
            duration: 2000,
            delay: index * 150,
            easing: "easeOutBack",
            render({ y }) {
                ref.current.position.y = y
            }
        })
    }, [])

    return (
        <mesh ref={ref} geometry={geometry} material={materials.ground} {...rest} />
    )
}

function StartBlock(props) {
    return (
        <>
            <Text
                position={[-.5, -50, 1.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={1}
            >
                R
            </Text>
            <Text
                position={[-.5, -50, -7]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={2}
            >
                U
            </Text>
            <Text
                position={[-.5, -50, -16]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={3}
            >
                N
            </Text>




            <Text
                position={[14, -50, 1.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={0}
            >
                B
            </Text>
            <Text
                position={[14, -50, -7]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={1}
            >
                R
            </Text>
            <Text
                position={[14, -50, -15.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={2}
            >
                I
            </Text>
            <Text
                position={[14, -50, -20]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={3}
            >
                T
            </Text>
            <Text
                position={[14, -50, -27]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={4}
            >
                N
            </Text>
            <Text
                position={[14, -50, -35.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={5}
            >
                E
            </Text>
            <Text
                position={[14, -50, -43]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={6}
            >
                Y
            </Text>



            <pointLight
                color={0xFF0000}
                intensity={30}
                distance={40}
                position={[20, -10, -20]}
            />

            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 30}
                dead={props.dead}
            />
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 25}
                index={1}
                dead={props.dead}
            />
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 20}
                index={2}
                dead={props.dead}
            />

        </>
    )
}

export default React.memo(StartBlock)



/*

            <Text
                position={[14, -50, 1.5]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
            >
                BRITNEY
            </Text>

            <Text
                position={[-.5, -50, -24]}
                rotation-y={Math.PI}
                rotation-x={Math.PI / 2}
                rotation-z={-Math.PI / 2}
                index={3}
            >
                ,
            </Text>

*/