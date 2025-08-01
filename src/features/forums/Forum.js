import { useNavigate } from 'react-router-dom'
import { useGetForumsQuery, useDeleteForumMutation } from './forumsApiSlice'
import { memo } from 'react'
import moment from 'moment'
import MenuButton from '../../components/MenuButton';

const Forum = ({ forumId, showSettingsMenu }) => {

    const navigate = useNavigate()
    const [deleteForum] = useDeleteForumMutation();

    const { forum } = useGetForumsQuery("forumsList", {
        selectFromResult: ({ data }) => ({
            forum: data?.entities[forumId]
        }),
    })

    if (forum) {
        const created = moment(forum.createdAt).format('MMMM D, YYYY h:mm A');
        const updated = moment(forum.updatedAt).format('MMMM D, YYYY h:mm A');

      

        const handleRowClick = () => navigate(`/dash/forums/${forumId}/expand`)
        const handleEdit = () => navigate(`/dash/forums/${forumId}/edit`); 

        // Delete handler
        const handleDelete = async () => {
            await deleteForum({ id: forumId });
        };

        return (
            <tr className="table__row" onClick={handleRowClick}>
                <td className="table__cell">{forum.title}</td>
                <td className="table__cell">{forum.username}</td>
                <td className="table__cell">{created}</td>
                <td className="table__cell">{updated}</td>
                {showSettingsMenu && (
                  <td
                    className="table__cell"
                    style={{ position: 'relative' }}
                    onClick={e => e.stopPropagation()} 
                  >
                    <MenuButton
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      variant="profile-activity-menu-button"
                    />
                  </td>
                )}
            </tr>
        )

    } else return null
}

const memoizedForum = memo(Forum)

export default memoizedForum