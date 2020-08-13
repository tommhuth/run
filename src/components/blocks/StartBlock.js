
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useThree } from "react-three-fiber"
import { useStore } from "../../data/store"
import { useCannon } from "../../data/cannon"
import random from "../../data/random"
import Coin from "../actors/Coin"


function StartBlock(props) {  
    return (
        <>
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 30}
            />
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 25}
            />
            <Coin
                x={0}
                y={props.y}
                z={props.start + props.depth - 20}
            />
        </>
    )
}

export default React.memo(StartBlock)