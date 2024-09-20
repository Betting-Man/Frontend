import React from 'react'
import Header from '../../components/Header/Header'
import ScoreBoard from '../../components/ScoreBoard/ScoreBoard'
import UserTable from '../../components/UserTable/UserTable'
import BetBoard from '../../components/BetBoard/BetBoard'

export default function SinglePlay() {
  return (
    <div>
        <Header/>
        <ScoreBoard/>
        <UserTable/>
        <BetBoard/>
    </div>
  )
}