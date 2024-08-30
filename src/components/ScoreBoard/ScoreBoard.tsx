import React from 'react'
import { Button } from "antd";

type Props = {}

export default function ScoreBoard({ }: Props) {
    return (
        <div className="p-2 flex justify-center">
            <h1>Round Score- 0</h1>
            <Button type="primary">Win</Button>
        </div>
    )
}