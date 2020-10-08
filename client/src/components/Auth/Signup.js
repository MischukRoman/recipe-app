import React, {useState} from 'react';
import {withRouter} from 'react-router-dom'
import {Mutation} from 'react-apollo'

import {SIGNUP_USER} from "../../queries";
import {Error} from "../Error";

const initialFormData = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: ""
};

const Signup = (props) => {

    const [formData, setFormData] = useState({
        ...initialFormData
    });

    const {username, email, password, passwordConfirmation} = formData;

    const handleChange = e => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value})
    };

    const clearFormData = () => {
        setFormData({...initialFormData})
    };

    const validateForm = () => {
        return !username || !email
            || !password
            || password !== passwordConfirmation;
    };

    const handleSubmit = (e, signupUser) => {
        e.preventDefault();

        signupUser().then(({data}) => {
            localStorage.setItem('token', data.signupUser.token);
            clearFormData();
            props.history.push('/');
        })
    };

    return (
        <div className="App">
            <h2 className="App">Signup</h2>
            <Mutation mutation={SIGNUP_USER} variables={{username, email, password}}>
                {(signupUser, {data, loading, error}) => (
                        <form className="form" onSubmit={e => handleSubmit(e, signupUser)}>

                            <input type="text"
                                   name="username"
                                   value={username}
                                   placeholder="Username"
                                   onChange={handleChange}/>

                            <input type="email"
                                   name="email"
                                   value={email}
                                   placeholder="Email address"
                                   onChange={handleChange}/>

                            <input type="password"
                                   name="password"
                                   value={password}
                                   placeholder="Password"
                                   onChange={handleChange}/>

                            <input type="password"
                                   name="passwordConfirmation"
                                   value={passwordConfirmation}
                                   placeholder="Confirm Password"
                                   onChange={handleChange}/>

                            <button type="submit"
                                    disabled={loading || validateForm()}
                                    className="button-primary">
                                Submit
                            </button>

                            {error && <Error error={error}/>}
                        </form>
                    )
                }
            </Mutation>
        </div>
    )
};

export default withRouter(Signup);