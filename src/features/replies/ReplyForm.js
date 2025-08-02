/**
 * Component for submitting a new reply to a forum post.
 * Handles form state, user tagging, submission, and validation.
 */
import { useState } from 'react';
import { useAddReplyMutation } from '../forums/forumsApiSlice';
import useAuth from '../../hooks/useAuth';
import { useGetUsersQuery } from '../users/usersApiSlice';
import { useRef } from 'react';

/**
 * ReplyForm component
 * @param {Object} props
 * @param {string} props.forumId - The forum ID to reply to
 * @param {Function} props.refetchReplies - Callback to refetch replies after submit
 * @param {Function} [props.onReplySubmitted] - Optional callback after reply is submitted
 */
const ReplyForm = ({ forumId, refetchReplies, onReplySubmitted }) => {
    // State for reply text
    const [replyText, setReplyText] = useState('');
    const [addReply] = useAddReplyMutation();
    
    const { username: senderUsername, userId: senderUserId } = useAuth();
    const { data: usersData } = useGetUsersQuery();
    const textareaRef = useRef(null);

    // State for user tag dropdown
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownUsers, setDropdownUsers] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [tagQuery, setTagQuery] = useState('');
    // State for dropdown selection index
    const [dropdownIndex, setDropdownIndex] = useState(0);

    const allUsernames = usersData ? Object.values(usersData.entities || {}).map(u => u.username) : [];
    
     // Handles changes to the reply textarea, including tag detection.
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
    
     // Handles selecting a username from the tag dropdown.
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
    
     // Handles keyboard navigation in the tag dropdown.
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

     // Handles form submission for adding a new reply.
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedReplyText = replyText.trim();
        const result = await addReply({ forumId, userId: senderUserId, replyText: trimmedReplyText, username: senderUsername });
        refetchReplies();
        setReplyText('');
        if (onReplySubmitted && result?.data?._id) onReplySubmitted(result.data._id);
    };

    // Whether the reply can be submitted
    const canReply = replyText.trim() !== ''
    
    // Render the reply form
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

            {/* Dropdown for user tagging */}
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

            {/* Submit reply button */}
            <button type="submit" disabled={!canReply} className='button'>
                Reply
            </button>
        </form>
    );
};

export default ReplyForm;