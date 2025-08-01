import { useState } from 'react';
import { useAddReplyMutation } from '../forums/forumsApiSlice';
import useAuth from '../../hooks/useAuth';
import { useGetUsersQuery } from '../users/usersApiSlice';
import { useRef } from 'react';

const ReplyForm = ({ forumId, refetchReplies, onReplySubmitted }) => {
    const [replyText, setReplyText] = useState('');
    const [addReply] = useAddReplyMutation();
    
    const { username: senderUsername, userId: senderUserId } = useAuth();
    const { data: usersData } = useGetUsersQuery();
    const textareaRef = useRef(null);

    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownUsers, setDropdownUsers] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [tagQuery, setTagQuery] = useState('');
    const [dropdownIndex, setDropdownIndex] = useState(0);

    const allUsernames = usersData ? Object.values(usersData.entities || {}).map(u => u.username) : [];

    const handleChange = (e) => {
        const value = e.target.value;
        setReplyText(value);
        const cursorPos = e.target.selectionStart;
        const textUpToCursor = value.slice(0, cursorPos);
        const match = textUpToCursor.match(/@([\w]*)$/);
        if (match) {
            const query = match[1].toLowerCase();
            const filtered = allUsernames.filter(u => u.toLowerCase().startsWith(query) && u !== senderUsername);
            setDropdownUsers(filtered);
            setTagQuery(query);
            setShowDropdown(filtered.length > 0);
            setDropdownIndex(0);
        } else {
            setShowDropdown(false);
            setTagQuery('');
        }
    };

    const handleSelect = (username) => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textUpToCursor = replyText.slice(0, cursorPos);
        const textAfterCursor = replyText.slice(cursorPos);
        const match = textUpToCursor.match(/@([\w]*)$/);
        if (match) {
            const beforeTag = textUpToCursor.slice(0, match.index);
            const newText = beforeTag + '@' + username + ' ' + textAfterCursor;
            setReplyText(newText);
            setShowDropdown(false);
            setTagQuery('');
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(beforeTag.length + username.length + 2, beforeTag.length + username.length + 2);
            }, 0);
        }
    };

    const handleKeyDown = (e) => {
        if (showDropdown) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setDropdownIndex(i => (i + 1) % dropdownUsers.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setDropdownIndex(i => (i - 1 + dropdownUsers.length) % dropdownUsers.length);
            } else if (e.key === 'Enter') {
                if (dropdownUsers[dropdownIndex]) {
                    e.preventDefault();
                    handleSelect(dropdownUsers[dropdownIndex]);
                }
            } else if (e.key === 'Escape') {
                setShowDropdown(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedReplyText = replyText.trim();
        const result = await addReply({ forumId, userId: senderUserId, replyText: trimmedReplyText, username: senderUsername });
        refetchReplies();
        setReplyText('');
        if (onReplySubmitted && result?.data?._id) onReplySubmitted(result.data._id);
    };

    const canReply = replyText.trim() !== ''
    
    return (
        <form onSubmit={handleSubmit} className='forum-post__replies' style={{ position: 'relative' }}>
            <textarea 
                ref={textareaRef}
                value={replyText} 
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder='Enter your reply' 
                autoComplete='off'
            />
            {showDropdown && (
                <ul className="tag-dropdown">
                    {dropdownUsers.map((u, i) => (
                        <li
                            key={u}
                            className={`tag-dropdown-item${i === dropdownIndex ? ' selected' : ''}`}
                            onMouseDown={e => { e.preventDefault(); handleSelect(u); }}
                        >
                            @{u}
                        </li>
                    ))}
                </ul>
            )}
            <button type="submit" disabled={!canReply} className='button'>
                Reply
            </button>
        </form>
    );
};

export default ReplyForm;