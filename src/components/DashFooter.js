import useAuth from "../hooks/useAuth"

const DashFooter = () => {

    const {username, status} = useAuth()

    const date = new Date()
    const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date)

    const content = (
        <footer className="dash-footer">
            <p>Current User: {username}</p>
            <p>Permissions: {status}</p>
            <p className="dash-footer-date">{today}</p>
        </footer>
    )
    return content
}
export default DashFooter