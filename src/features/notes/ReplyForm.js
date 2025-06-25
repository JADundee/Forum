import { useState } from 'react';
import { useAddReplyMutation, useCreateNotificationMutation } from './notesApiSlice';
import useAuth from '../../hooks/useAuth';

const ReplyForm = ({ noteId, userId: noteOwnerId, refetchReplies, onReplySubmitted }) => {
    const [replyText, setReplyText] = useState('');
    const [addReply] = useAddReplyMutation();
    const [createNotification] = useCreateNotificationMutation();
    const { username: senderUsername, userId: senderUserId } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await addReply({ noteId, userId: senderUserId, replyText, username: senderUsername });
        if (noteOwnerId !== senderUserId) {
            await createNotification({
                userId: String(noteOwnerId),
                noteId,
                replyText,
                username: senderUsername
            });
        }
        refetchReplies();
        setReplyText('');
        if (onReplySubmitted && result?.data?._id) onReplySubmitted(result.data._id);
    };

    const canReply = replyText.trim() !== ''
    
    return (
        <form onSubmit={handleSubmit} className='blog-post__replies'>
            <textarea 
                value={replyText} 
                onChange={(e) => setReplyText(e.target.value)} 
                placeholder='Enter your reply' 
            />
            <button type="submit" disabled={!canReply} className='button'>
                Reply
            </button>
        </form>
    );
};

export default ReplyForm;