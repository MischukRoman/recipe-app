import React, {useState} from 'react';
import {ApolloConsumer} from 'react-apollo';

import {SEARCH_RECIPES} from '../../queries';
import SearchItem from './SearchItem';

const Search = () => {
    const [searchResult, setSearchResult] = useState([]);

    const handleChange = async (e, client) => {
        e.persist();
        const {data} = await client.query({
            query: SEARCH_RECIPES,
            variables: {searchTerm: e.target.value}
        });
        setSearchResult(data.searchRecipes);
    };

    return (
        <ApolloConsumer>
            {client => (
                <div className="App">
                    <input type="search"
                           className={'search'}
                           placeholder="Search for Recipes"
                           onChange={async e => handleChange(e, client)}/>
                    <ul>
                        {searchResult && searchResult.map((recipe) => (
                            <SearchItem key={recipe._id} {...recipe}/>
                        ))}
                    </ul>
                </div>
            )
            }
        </ApolloConsumer>
    );
};

export default Search;