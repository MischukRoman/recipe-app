import React, {useState} from 'react';
import {withRouter} from 'react-router-dom'
import {Mutation} from 'react-apollo'

import {SIGNIN_USER} from "../../queries";
import {Error} from "../Error";

const initialFormData = {
    username: "",
    password: "",
};

const Signin = (props) => {

    const [formData, setFormData] = useState({
        ...initialFormData
    });

    const {username, password} = formData;

    const handleChange = e => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value})
    };

    const clearFormData = () => {
        setFormData({...initialFormData})
    };

    const validateForm = () => {
        return !username || !password
    };

    const handleSubmit = (e, signinUser) => {
        e.preventDefault();

        signinUser().then(async ({data}) => {
            localStorage.setItem('token', data.signinUser.token);
            await props.refetch();
            clearFormData();
            props.history.push('/')
        })
    };

    return (
        <div className="App">
            <h2 className="App">Signin</h2>
            <Mutation mutation={SIGNIN_USER} variables={{username, password}}>
                {(signinUser, {data, loading, error}) => {

                    return (
                        <form className="form" onSubmit={e => handleSubmit(e, signinUser)}>

                            <input type="text"
                                   name="username"
                                   value={username}
                                   placeholder="Username"
                                   onChange={handleChange}/>

                            <input type="password"
                                   name="password"
                                   value={password}
                                   placeholder="Password"
                                   onChange={handleChange}/>

                            <button type="submit"
                                    disabled={loading || validateForm()}
                                    className="button-primary">
                                Submit
                            </button>

                            {error && <Error error={error}/>}
                        </form>
                    )
                }}
            </Mutation>
        </div>
    )
};

export default withRouter(Signin);
