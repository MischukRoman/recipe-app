import React, {useEffect, useState} from 'react';
import posed from 'react-pose';
import './App.css';

import {Query} from 'react-apollo'
import {GET_ALL_RECIPES} from '../queries'
import RecipeItem from "./Recipe/RecipeItem";
import Spinner from "./Spinner";

const RecipeList = posed.ul({
    shown: {
        x: '0%',
        staggerChildren: 100
    },
    hidden: {
        x: '-100%'
    }
});

const App = () => {
    const [state, setState] = useState({
        on: false
    });

    useEffect(() => {
        setTimeout(slideIn, 200)
    }, []);

    const slideIn = () => {
        setState(prevData => ({...prevData, on: !prevData.on}))
    };

    return (
        <div className="App">
            <h1 className="main-title">
                Find Recipes You <strong>Love</strong>
            </h1>
            <Query query={GET_ALL_RECIPES}>
                {({data, loading, error}) => {
                    if (loading) return <Spinner/>;
                    if (error) return <div>Error</div>;

                    const {on} = state;
                    return (
                        <RecipeList
                            pose={on ? 'shown' : 'hidden'}
                            className="cards"
                        >
                            {data.getAllRecipes.map((recipe) => (
                                <RecipeItem key={recipe._id} {...recipe}/>
                            ))}
                        </RecipeList>
                    )
                }}
            </Query>
        </div>
    );
};

export default App;
