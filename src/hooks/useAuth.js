import { useSelector } from 'react-redux'
import { selectCurrentToken } from "../features/auth/authSlice"
import {jwtDecode} from 'jwt-decode'

const useAuth = () => {
    const token = useSelector(selectCurrentToken)
    let isAdmin = false
    let status = "Member"
    let userId = null;

    if (token) {
        const decoded = jwtDecode(token)
        const { username, roles, _id } = decoded.UserInfo

        userId = _id;
        isAdmin = roles.includes('Admin')
 
        if (isAdmin) status = "Admin"

        return { username, roles, status, isAdmin, userId }
    }

    return { username: '', roles: [], isAdmin, status, userId }
}
export default useAuth