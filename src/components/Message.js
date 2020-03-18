import React from "react"
import "./style/message.scss"

export default function Message({ text }) {
    return (
        <div className="message">
            {text}
        </div>
    )
}