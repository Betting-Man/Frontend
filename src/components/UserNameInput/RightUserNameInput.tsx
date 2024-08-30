import {
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Input } from "antd";

type Props = {
    user : string
}

export default function RightUserNameInput({user }: Props) {
    return (
        <div className="flex items-center">
            <Input value={user} />
            <FontAwesomeIcon icon={faUser} size='2xl' />
        </div>
    )
}