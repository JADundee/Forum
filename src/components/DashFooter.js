import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse } from "@fortawesome/free-solid-svg-icons"
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from "../hooks/useAuth"

const DashFooter = () => {

    const {username, status} = useAuth()

    const navigate = useNavigate()
    const { pathname } = useLocation()

    const onGoHomeClicked = () => navigate('/dash')

    let goHomeButton = null
    if (pathname !== '/dash') {
        goHomeButton = (
            <button
                className="dash-footer__button icon-button"
                title="Home"
                onClick={onGoHomeClicked}
            >
                <FontAwesomeIcon icon={faHouse} />
            </button>
        )
    }

        const date = new Date()
        const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date)

    const content = (
        <footer className="dash-footer">
            {goHomeButton}
            <p>Current User: {username}</p>
            <p>Permissions: {status}</p>
            <p className="dash-footer-date">{today}</p>
        </footer>
    )
    return content
}
export default DashFooter