import { useNavigate, useLocation } from 'react-router-dom';

const PublicHeader = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isLoginPage = pathname === '/';
    return (
        <header className="public__header">
            {isLoginPage ? (
                <h1 className="public__header-link public__header-link--disabled">Forum</h1>
            ) : (
                <span
                    className="public__header-link"
                    onClick={() => navigate('/')}
                    tabIndex={0}
                    role="button"
                    onKeyPress={e => { if (e.key === 'Enter') navigate('/') }}
                >       
                    Forum
                </span>
            )}
        </header>
    );
};

export default PublicHeader; 