import { Button } from "antd";

type Props = {}

export default function BetBoard({ }: Props) {
  return (
    <div className='bg-secondary px-3 py-6 absolute bottom-0 w-96'>
      <div className='flex justify-between '>
        <Button type="primary">100</Button>
        <Button type="primary">500</Button>
        <Button type="primary">1000</Button>
        <Button type="primary">BET</Button>
        <Button type="primary">CANCEL</Button>
      </div>
      <div className='flex justify-around mt-6'>
        <Button type="primary" >CHECK / CALL</Button>
        <Button type="primary">DIE</Button>
      </div>

    </div>
  )
}