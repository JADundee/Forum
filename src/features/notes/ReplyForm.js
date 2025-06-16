import React, { useState} from 'react';
import { useAddReplyMutation } from './notesApiSlice';


const ReplyForm = ({ noteId, userId, username, refetchReplies }) => {

    const [replyText, setReplyText] = useState('');
    const [addReply, { isLoading }] = useAddReplyMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReply({ noteId, userId, replyText, username });
     refetchReplies();
  };


  const canReply = replyText.trim() !== ''
  

  return (
    <form onSubmit={handleSubmit} className='blog-post__replies'>
      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} />
      <button type="submit" disabled={!canReply} className={`${canReply ? '' : 'disabled-button'}`}>
        Reply
      </button>
    </form>
  );
};

export default ReplyForm;