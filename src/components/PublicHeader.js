import { useNavigate } from 'react-router-dom';

const PublicHeader = () => {
    const navigate = useNavigate();
    return (
        <header className="public__header">
            <span
                className="public__header-link"
                onClick={() => navigate('/')}
                tabIndex={0}
                role="button"
                onKeyPress={e => { if (e.key === 'Enter') navigate('/') }}
            >
                theForum
            </span>
        </header>
    );
};

export default PublicHeader; 