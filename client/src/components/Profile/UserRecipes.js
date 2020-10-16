import React from 'react';
import {Link} from "react-router-dom";
import {Query, Mutation} from "react-apollo";

import {DELETE_USER_RECIPE, GET_ALL_RECIPES, GET_CURRENT_USER, GET_USER_RECIPES} from "../../queries";
import Spinner from "../Spinner";

const UserRecipes = ({username}) => {

    const handleDelete = deleteUserRecipe => {
        const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
        if (confirmDelete) {
            deleteUserRecipe().then(({data}) => {
                /*console.log(data);*/
            })
        }
    };

    return (
        <Query query={GET_USER_RECIPES} variables={{username}}>
            {({data, loading, error}) => {
                if (loading) return <Spinner/>;
                if (error) return <div>Error</div>;
                return (
                    <ul>
                        <EditRecipeModal/>
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
                                                      })

                                                  }}>
                                            {(deleteUserRecipe, attrs = {}) => (
                                                <div>
                                                    <button className={"button-primary"}>Update</button>
                                                    <p onClick={() => handleDelete(deleteUserRecipe)}
                                                       className={"delete-button"}>
                                                        {attrs.loading ? 'loading...' : 'X'}
                                                    </p>
                                                </div>
                                            )
                                            }
                                        </Mutation>
                                    </li>
                                )
                            })
                        }
                    </ul>
                )
            }}
        </Query>
    )
        ;
};

const EditRecipeModal = () => (
    <div className="modal modal-open">
        <div className="modal-inner">
            <div className="modal-content">
                <form className="modal-content-inner">
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
                </form>
            </div>
        </div>
    </div>
);

export default UserRecipes;