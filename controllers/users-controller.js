const {v4} = require('uuid');
const HttpError = require('../models/httpError');
const { validationResult } = require('express-validator');

const users = [
  {
    id: v4(),
    name: 'Test',
    email: 'test@test.com',
    password: 'test',
  },
];

const getAllUsers = (req, res, next) => {
    res.json(users);
}

const signUpUser = (req, res, next) => {
  const { name, email, password} = req.body;

  if(users.find(x => x.email === email)){
    return next(new HttpError('User already exist, please log in!', 404));
  }

  const createdUser = {
    id: v4(),
    name,
    email,
    password
  };


  users.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const loginUser = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError("Invalid input passed", 422));
    }
    const { email, password } = req.body;
    const foundUser = users.find( x => x.email === email);
    if(!foundUser || foundUser.password !== password){
        return next(new HttpError("No valid credentials", 404));
    }

    res.json({message: 'logged in!'});

};

exports.getAllUsers = getAllUsers;
exports.signUpUser = signUpUser;
exports.loginUser = loginUser;