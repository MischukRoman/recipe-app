import React, {useEffect, useState} from 'react';
import {Mutation} from 'react-apollo';
import {ADD_RECIPE, GET_ALL_RECIPES, GET_CURRENT_USER, GET_USER_RECIPES} from "../../queries";
import {Error} from "../Error";
import {withRouter} from "react-router-dom";
import withAuth from "../withAuth";

const initialRecipeData = {
    name: "",
    imageUrl: "",
    instructions: "",
    category: "Breakfast",
    description: "",
    username: ""
};

const AddRecipe = ({session, history}) => {

    const [recipeData, setRecipeData] = useState({
        ...initialRecipeData
    });

    useEffect(() => {
        setRecipeData({...recipeData, username: session.getCurrentUser.username})
    }, []);

    const {name, imageUrl, category, description, instructions, username} = recipeData;

    const handleChange = e => {
        const {name, value} = e.target;
        setRecipeData({...recipeData, [name]: value})
    };

    const clearRecipeData = () => {
        setRecipeData({...initialRecipeData})
    };

    const validateForm = () => {
        return !name || !imageUrl || !category || !description || !instructions;
    };

    const updateCache = (cache, {data: {addRecipe}}) => {
        const {getAllRecipes} = cache.readQuery({query: GET_ALL_RECIPES});
        cache.writeQuery({
            query: GET_ALL_RECIPES,
            data: {
                getAllRecipes: [addRecipe, ...getAllRecipes]
            }
        });
    };

    const handleSubmit = (e, addRecipe) => {
        e.preventDefault();

        addRecipe().then(async ({data}) => {
            clearRecipeData();
            history.push('/');
        })
    };

    return (
        <Mutation mutation={ADD_RECIPE}
                  refetchQueries={() => [
                      {query: GET_USER_RECIPES, variables: {username}}
                  ]}
                  update={updateCache}
                  variables={{name, imageUrl, category, description, instructions, username}}>
            {(addRecipe, {data, loading, error}) => (
                    <div className="App">
                        <h2 className="App">Add Recipe</h2>
                        <form className="form" onSubmit={(e) => handleSubmit(e, addRecipe)}>
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
                            <textarea name="instructions"
                                      value={instructions}
                                      onChange={handleChange}
                                      placeholder="Add instructions"/>
                            <button type="submit"
                                    disabled={loading || validateForm()}
                                    className="button-primary">Submit
                            </button>
                            {error && <Error error={error}/>}
                        </form>
                    </div>
                )
            }
        </Mutation>
    )
};

export default withAuth(session => session && session.getCurrentUser)(withRouter(AddRecipe));