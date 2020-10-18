const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const createToken = (user, secret, expiresIn) => {
    const {username, email} = user;
    return jwt.sign({username, email}, secret, {expiresIn});
};

exports.resolvers = {
    Query: {
        getAllRecipes: async (root, args, {Recipe}) => {
            const allRecipes = await Recipe.find().sort({createdDate: 'desc'});
            return allRecipes;
        },

        getRecipe: async (root, {_id}, {Recipe}) => {
            const recipe = await Recipe.findOne({_id});
            return recipe;
        },

        searchRecipes: async (root, {searchTerm}, {Recipe}) => {
            if (searchTerm) {
                // search{"$text":{"$search":"Fake"}}
                const searchResults = await Recipe.find({
                    $text: {$search: searchTerm}
                }, {
                    score: {$meta: 'textScore'}
                }).sort({
                    score: {$meta: 'textScore'}
                });
                return searchResults;
            } else {
                const recipes = await Recipe.find().sort({likes: 'desc', createdDate: 'desc'});
                return recipes;
            }
        },

        getCurrentUser: async (root, args, {currentUser, User}) => {
            if (!currentUser) return null;
            const user = await User.findOne({username: currentUser.username})
                .populate({
                    path: 'favorites',
                    model: 'Recipe'
                });
            console.log('user: ', user);
            return user;
        },

        getUserRecipes: async (root, {username}, {Recipe}) => {
            const userRecipes = await Recipe.find({username}).sort({createdDate: 'desc'});
            return userRecipes;
        }
    },
    Mutation: {
        addRecipe: async (root, {name, imageUrl, description, category, instructions, username}, {Recipe}) => {
            const newRecipe = await new Recipe({
                name, description, imageUrl, category, instructions, username
            }).save();
            return newRecipe;
        },

        likeRecipe: async (root, {_id, username}, {Recipe, User}) => {
            const recipe = await Recipe.findOneAndUpdate({_id}, {$inc: {likes: 1}});
            await User.findOneAndUpdate({username}, {$addToSet: {favorites: _id}});
            return recipe;
        },

        unlikeRecipe: async (root, {_id, username}, {Recipe, User}) => {
            const recipe = await Recipe.findOneAndUpdate({_id}, {$inc: {likes: -1}});
            await User.findOneAndUpdate({username}, {$pull: {favorites: _id}});
            return recipe;
        },

        deleteUserRecipe: async (root, {_id}, {Recipe}) => {
            const recipe = await Recipe.findOneAndRemove({_id});
            return recipe;
        },

        updateUserRecipe: async (root, {_id, name, imageUrl, description, category}, {Recipe}) => {
            const updatedRecipe = await Recipe.findOneAndUpdate(
                {_id},
                {$set: {name, imageUrl, description, category}},
                {new: true}
            );
            return updatedRecipe;
        },

        signinUser: async (root, {username, password}, {User}) => {
            const user = await User.findOne({username});
            if (!user) {
                throw new Error('User not found');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) throw new Error('Invalid password');

            return {token: createToken(user, process.env.SECRET, '24hr')};
        },

        signupUser: async (root, {username, email, password}, {User}) => {
            const user = await User.findOne({username});
            if (user) {
                throw new Error('User already exists');
            }

            const newUser = await new User({
                username, email, password
            }).save();
            return {token: createToken(newUser, process.env.SECRET, '24hr')};
        }
    }
};