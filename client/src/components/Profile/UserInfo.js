import React from 'react';
import {Link} from "react-router-dom";

const formatDate = date => {
    const newDate = new Date(date).toLocaleDateString('ru-RU');
    const newTime = new Date(date).toLocaleTimeString('ru-RU');
    return `${newDate} at ${newTime}`
};

const UserInfo = ({session}) => {
    const {username, email, joinDate, favorites} = session?.getCurrentUser;
    return (
        <div>
            <h3>User Info</h3>
            <p>Username: {username}</p>
            <p>Email: {email}</p>
            <p>Join Date: {formatDate(joinDate)}</p>
            <ul>
                <h3>{username}'s Favorites</h3>
                {favorites.map(favorite => {
                    const {_id, name} = favorite;
                    return (
                        <li key={_id}>
                            <Link to={`/recipes/${_id}`}><p>{name}</p></Link>
                        </li>
                    )
                })}
                {!favorites.length && <p><strong>
                    You have no favorites currently. Go add some!
                </strong></p>}
            </ul>
        </div>
    );
};

export default UserInfo;