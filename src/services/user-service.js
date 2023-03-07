const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_KEY } = require('../config/serverConfig');

const UserRepository = require('../repository/user-repository');
const { response } = require('express');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }
    async create(data) {
        try {
            const user = await this.userRepository.create(data);
            return user;
        } catch (error) {
            console.log("Something went wrong in service layer");
            throw error;
        }
    }

    async signIn(email, plainPassword) {
        try {
            //step 1 -> fetch the user using the email
            const user = await this.userRepository.getByEmail(email);
            //step 2 -> compare incoming plain password with stores encrypted password
            const passwordsMatch = this.checkPassword(plainPassword, user.password);
            if (!passwordsMatch) {
                console.log("Password doesn't match");
                throw { error: 'Incorrect Password' };
            }
            // step 3 -> if passwords match then create a token and send it to the user
            const newJWT = this.createToken({ email: user.email, id: user.id });
            return newJWT;

        } catch (error) {
            console.log("Something went wrong in the signin process");
            throw error;
        }
    }

    createToken(user) {
        try {
            const result = jwt.sign(user, JWT_KEY, { expiresIn: '1d' });
            return result;
        } catch (error) {
            console.log("Something went wrong in token creation", error);
            throw error;
        }
    }

    verifyToken(token) {
        try {
            const response = jwt.verify(token, JWT_KEY);
            return response;
        } catch (error) {
            console.log("Something went wrong in token validation", error);
            throw error;
        }
    }

    async isAuthenticated(token) {
        try {
            const isTokenVerified = this.verifyToken(token);
            if (!isTokenVerified) {
                throw { error: 'Invalid token' }
            }
            const user = await this.userRepository.getById(response.id);
            if (!user) {
                throw { error: 'Noo user with corresponding token exist' };
            }
            return user.id;
        } catch (error) {
            console.log("Something went wrong in the auth process");
            throw error;
        }
    }
    checkPassword(userInputPlainPassword, encryptedPassword) {
        try {
            return bcrypt.compareSync(userInputPlainPassword, encryptedPassword);
        } catch (error) {
            console.log("Something went wrong in password comparison");
            throw error;
        }
    }
    isAdmin(userId) {
        try {
            return this.userRepository.isAdmin(userId);
        } catch (error) {
            console.log("Something went wrong in service layer");
            throw error;
        }
    }
}

module.exports = UserService;