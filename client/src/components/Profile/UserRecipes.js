import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {Query, Mutation} from 'react-apollo';

import {
    DELETE_USER_RECIPE,
    GET_ALL_RECIPES,
    GET_CURRENT_USER,
    GET_USER_RECIPES,
    UPDATE_USER_RECIPE
} from '../../queries';
import Spinner from '../Spinner';

const UserRecipes = ({username}) => {
    const [changedRecipe, setChangedRecipe] = useState({
        _id: '',
        name: '',
        imageUrl: '',
        category: '',
        description: '',
        modal: false
    });

    const {_id, name, imageUrl, category, description, modal} = changedRecipe;

    const handleChange = event => {
        const {name, value} = event.target;
        setChangedRecipe(prev => ({...prev, [name]: value}));
    };

    const handlerSubmit = (event, recipe, updateUserRecipe) => {
        event.preventDefault();
        updateUserRecipe({recipe}).then(({data}) => {
            closeModal();
        });
        const {name, value} = event.target;
        setChangedRecipe(prev => ({...prev, [name]: value}));
    };

    const handleDelete = deleteUserRecipe => {
        const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
        if (confirmDelete) {
            deleteUserRecipe();
        }
    };

    const closeModal = () => {
        setChangedRecipe(prev => ({...prev, modal: false}));
    };
    const loadRecipe = (recipe) => {
        setChangedRecipe({...recipe, modal: true});
    };

    return (
        <Query query={GET_USER_RECIPES} variables={{username}}>
            {({data, loading, error}) => {
                if (loading) return <Spinner/>;
                if (error) return <div>Error</div>;
                return (
                    <ul>
                        {modal && <EditRecipeModal changedRecipe={{_id, name, imageUrl, category, description}}
                                                   handlerSubmit={handlerSubmit}
                                                   handleChange={handleChange}
                                                   closeModal={closeModal}/>}
                        <h3>Your Recipes</h3>
                        {!data.getUserRecipes.length && <p><strong>You have not added any recipes yet</strong></p>}
                        {
                            data.getUserRecipes.map(recipe => {
                                const {_id, name, likes} = recipe;
                                return (
                                    <li key={_id}>
                                        <Link to={`/recipes/${_id}`}>
                                            <p>{name}</p>
                                        </Link>
                                        <p style={{marginBottom: 0}}>Likes: {likes}</p>
                                        <Mutation mutation={DELETE_USER_RECIPE}
                                                  variables={{_id}}
                                                  refetchQueries={() => [
                                                      {query: GET_ALL_RECIPES},
                                                      {query: GET_CURRENT_USER}
                                                  ]}
                                                  update={(cache, {data: {deleteUserRecipe}}) => {
                                                      const {getUserRecipes} = cache.readQuery({
                                                          query: GET_USER_RECIPES,
                                                          variables: {username}
                                                      });

                                                      cache.writeQuery({
                                                          query: GET_USER_RECIPES,
                                                          variables: {username},
                                                          data: {
                                                              getUserRecipes: getUserRecipes.filter(recipe => recipe._id !== deleteUserRecipe._id)
                                                          }
                                                      });

                                                  }}>
                                            {(deleteUserRecipe, attrs = {}) => (
                                                <div>
                                                    <button className={'button-primary'}
                                                            onClick={() => loadRecipe(recipe)}>Update
                                                    </button>
                                                    <p onClick={() => handleDelete(deleteUserRecipe)}
                                                       className={'delete-button'}>
                                                        {attrs.loading ? 'loading...' : 'X'}
                                                    </p>
                                                </div>
                                            )}
                                        </Mutation>
                                    </li>
                                );
                            })
                        }
                    </ul>
                );
            }}
        </Query>
    );
};

const EditRecipeModal = ({handlerSubmit, changedRecipe, handleChange, closeModal}) => {
    const {
        name,
        imageUrl,
        category,
        description
    } = changedRecipe;

    return (
        <Mutation mutation={UPDATE_USER_RECIPE} variables={changedRecipe}>
            {updateUserRecipe => (
                <div className="modal modal-open">
                    <div className="modal-inner">
                        <div className="modal-content">
                            <form onSubmit={event => handlerSubmit(event, changedRecipe, updateUserRecipe)}
                                  className="modal-content-inner">
                                <h4>Edit Recipe</h4>

                                <input type="text"
                                       name="name"
                                       value={name}
                                       onChange={handleChange}
                                       placeholder="Recipe Name"/>
                                <input type="text"
                                       name="imageUrl"
                                       value={imageUrl}
                                       onChange={handleChange}
                                       placeholder="Recipe Image"/>
                                <select name="category"
                                        value={category}
                                        onChange={handleChange}>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snack">Snack</option>
                                </select>
                                <input type="text"
                                       name="description"
                                       value={description}
                                       onChange={handleChange}
                                       placeholder="Add descriptions"/>

                                <hr/>
                                <div className="modal-buttons">
                                    <button type="submit" className="button-primary">
                                        Update
                                    </button>
                                    <button onClick={closeModal}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Mutation>
    );
};

export default UserRecipes;