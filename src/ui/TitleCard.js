import cn from "classnames"
import React from "react"

import "./style/title-card.scss"

export default function TitleCard({ lines = [], big }) {
    let c = 0

    return (
        <div className={cn("title-card", { "title-card--big": big })}>
            <span className="visually-hidden">{lines.join(" ")}</span>

            {lines.map((j, index1) => {
                return (
                    <React.Fragment key={j}>
                        {j.split("").map((i, index2) => {
                            c++

                            return (
                                <span
                                    className="title-card__letter"
                                    key={j + index2}
                                    aria-hidden
                                    style={{ "--delay": (c * .075 + (big ? .25 : 0)) + "s" }}
                                >
                                    {i}
                                </span>
                            )
                        })}
                        {index1 === lines.length - 1 ? null : <br />}
                    </React.Fragment>
                )
            })}
        </div>
    )
}