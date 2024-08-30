import React from 'react'
import { Button  } from "antd";

type Props = {}

export default function BetBoard({}: Props) {
  return (
    <div className='bg-secondary p-3 absolute bottom-0 w-96'>
        <div className='flex'>
            <Button type="primary">100</Button>
            <Button type="primary">500</Button>
            <Button type="primary">1000</Button>
            <Button type="primary">BET</Button>
            <Button type="primary">CANCEL</Button>
        </div>
        <div>
        <Button type="primary">CHECK / CALL</Button>
        <Button type="primary">DIE</Button>
        </div>
        
    </div>
  )
}