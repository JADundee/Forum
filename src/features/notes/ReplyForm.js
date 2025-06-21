import { useState } from 'react';
import { useAddReplyMutation } from './notesApiSlice';


const ReplyForm = ({ noteId, userId, username, refetchReplies }) => {

    const [replyText, setReplyText] = useState('');
    const [addReply] = useAddReplyMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReply({ noteId, userId, replyText, username });
     refetchReplies();
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