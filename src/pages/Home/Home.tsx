import React from 'react'
import { Button } from 'antd';
import { Link } from 'react-router-dom';

type Props = {}

export default function Home({}: Props) {
  return (
    <>
    <div>
    <Link to="/single">
        <Button type="primary">Single</Button>
      </Link>
    </div>
    
    </>
  )
}