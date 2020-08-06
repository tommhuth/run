import React from "react"

function Only(props) {
    return props.if ? <>{props.children}</> : null
}

export default React.memo(Only)