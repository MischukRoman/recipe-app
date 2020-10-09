import React, {useEffect, useState} from 'react';
import {Mutation} from 'react-apollo';

import {GET_RECIPE, LIKE_RECIPE, UNLIKE_RECIPE} from "../../queries";
import {withSession} from "../withSession";

const LikeRecipe = ({refetch, session, _id}) => {
    const [username, setUsername] = useState("");
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        if (session.getCurrentUser) {
            const {username, favorites} = session.getCurrentUser;
            const prevLiked = favorites.findIndex(favorite => favorite._id === _id) > -1;
            setUsername(username);
            setLiked(prevLiked);
        }
    }, []);

    const handleClick = (likeRecipe, unlikeRecipe) => {
        setLiked(!liked);
        handleLike(likeRecipe, unlikeRecipe);
    };

    const handleLike = (likeRecipe, unlikeRecipe) => {
        if (!liked) {
            // like recipe
            likeRecipe().then(async ({data}) => {
                await refetch();
            })
        } else {
            // unlike recipe
            unlikeRecipe().then(async ({data}) => {
                await refetch();
            })
        }
    };

    const updateLike = (cache, {data: {likeRecipe}}) => {
        const {getRecipe} = cache.readQuery({query: GET_RECIPE, variables: {_id}});
        cache.writeQuery({
            query: GET_RECIPE,
            variables: {_id},
            data: {
                getRecipe: {...getRecipe, likes: likeRecipe.likes + 1}
            }
        });
    };

    const updateUnlike = (cache, {data: {unlikeRecipe}}) => {
        const {getRecipe} = cache.readQuery({query: GET_RECIPE, variables: {_id}});
        cache.writeQuery({
            query: GET_RECIPE,
            variables: {_id},
            data: {
                getRecipe: {...getRecipe, likes: unlikeRecipe.likes - 1}
            }
        });
    };

    return (
        <Mutation mutation={UNLIKE_RECIPE}
                  update={updateUnlike}
                  variables={{_id, username}}>
            {
                unlikeRecipe => (
                    <Mutation mutation={LIKE_RECIPE}
                              update={updateLike}
                              variables={{_id, username}}>
                        {
                            likeRecipe => <>
                                {username && (
                                    <button
                                        className="like-button"
                                        onClick={() => handleClick(likeRecipe, unlikeRecipe)}>
                                        {liked ? 'Unlike' : 'Like'}
                                    </button>
                                )}
                            </>
                        }
                    </Mutation>
                )
            }
        </Mutation>
    )
};

export default withSession(LikeRecipe);