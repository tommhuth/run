import React from "react"

export default function Only(props) {
    return props.if ? <>{props.children}</> : null
}