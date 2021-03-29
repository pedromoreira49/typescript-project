import { Router } from 'express';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import knex from '../database/connection';

const sessionsRouter = Router();

sessionsRouter.post('/', async (req, res) => {
    const {  email, password} = req.body;

    const user = await knex('users').where('email', email).first();

    if(!user){
        return res.status(400).json({ message: 'Credentials not found.'});
    }

    const comparePassword = compare(password, user.password);

    if(!comparePassword){
        return res.status(400).json({ message: 'Credentials not found.'});
    }

    const token = sign({}, 'a6dadbd7f7c606c56f30404844c4a256', {
        subject: String(user.id),
        expiresIn: '1d'
    });

    return res.json({ user, token });
});

export default sessionsRouter;