import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const Welcome = () => {

    const {username, isAdmin} = useAuth()

    const content = (
        <section className="welcome">

            <h1>Welcome, {username}!</h1>

            <p><Link to="/dash/notes">View Threads</Link></p>

            <p><Link to="/dash/notes/new">Add New Thread</Link></p>

            {( isAdmin ) && <p><Link to="/dash/users">View Users</Link></p>}

        </section>
    )

    return content
}
export default Welcome