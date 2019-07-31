import React from "react"
import BlockType from "../../const/BlockType"
import Flat from "./Flat"
import Platforms from "./Platforms"
import Gap from "./Gap"

export default function Block(props) {
    switch (props.type) {
        case BlockType.FLAT:
            return <Flat {...props} key={props.id} />
        case BlockType.PLATFORMS:
            return <Platforms {...props} key={props.id} />
        case BlockType.GAP:
            return <Gap {...props} key={props.id} />
        default:
            throw new Error("Unknown block type " + props.type)
    }
}
