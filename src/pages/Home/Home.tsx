import React from 'react'
import { Button } from 'antd';
import { Link } from 'react-router-dom';

type Props = {}

export default function Home({}: Props) {
  return (
    <>
    <div className='flex items-center justify-center h-full'>
    <Link to="/single">
        <Button type="primary">Single</Button>
      </Link>
    </div>
    
    </>
  )
}