import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

import App from './components/App';

import './index.css';

import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';
import Signin from "./components/Auth/Signin";
import Signup from "./components/Auth/Signup";
import {withSession} from "./components/withSession";
import Navbar from "./components/Navbar";
import Search from "./components/Recipe/Search";
import Profile from "./components/Profile/Profile";
import AddRecipe from "./components/Recipe/AddRecipe";
import RecipePage from "./components/Recipe/RecipePage";

const client = new ApolloClient({
    /*uri: "https://recipes-app-gql.herokuapp.com/graphql",*/
    uri: "http://localhost:4444/graphql",
    fetchOptions: {
        credentials: true
    },
    request: operation => {
        const token = localStorage.getItem('token');
        operation.setContext({
            headers: {
                authorization: token
            }
        })
    },
    onError: ({networkError}) => {
        if (networkError) {
            console.log('Network error', networkError);
        }
    }
});

const Root = ({refetch, session}) => (
    <Router>
        <React.Fragment>
            <Navbar session={session}/>
            <Switch>
                <Route path="/" exact component={App}/>
                <Route path="/signin" render={() => <Signin refetch={refetch}/>}/>
                <Route path="/signup" render={() => <Signup refetch={refetch}/>}/>
                <Route path="/recipe/add" render={() => <AddRecipe session={session}/>}/>
                <Route path="/profile" render={() => <Profile session={session}/>}/>
                <Route path="/recipes/:_id" component={RecipePage}/>
                <Route path="/search" component={Search}/>
                <Redirect to="/"/>
            </Switch>
        </React.Fragment>
    </Router>
);

const RootWithSession = withSession(Root);

ReactDOM.render(
    <ApolloProvider client={client}>
        <RootWithSession/>
    </ApolloProvider>,
    document.getElementById('root')
);