import React, { useState } from 'react';
import { useAddReplyMutation } from './notesApiSlice';
import useAuth from '../../hooks/useAuth';

const ReplyForm = ({ noteId }) => {
    const { userId } = useAuth();
    const [replyText, setReplyText] = useState('');
    const [addReply, { isLoading }] = useAddReplyMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReply({ noteId, userId, replyText });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} />
      <button type="submit" disabled={isLoading}>
        Reply
      </button>
    </form>
  );
};

export default ReplyForm;