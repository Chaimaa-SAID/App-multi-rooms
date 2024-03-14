import express from 'express';
import UserModel from '../models/user.js';

const router = express.Router();

import { ensureLoggedIn } from 'connect-ensure-login';
import passport from 'passport';
import ChatRoomModel from '../models/chatRoom.js';

router.get('/connexion', function (req, res) {
  res.render('connexion.ejs');
});

router.get('/', ensureLoggedIn({ redirectTo: '/connexion' }), async (req, res) => {
  const rooms = await ChatRoomModel.find();
  let users = await UserModel.find();
  if (users && users.length > 0) {
    users = users.filter(user => user.username !== req.user.username)
  }

  res.render('index.ejs', { username: req.user.username, rooms: rooms, users: users });
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/connexion' }), function (req, res) {
  res.redirect('/');
});

router.get('/register', function (req, res) {
  res.render('inscription.ejs');
});

router.post('/register', async (req, res, next) => {

  const { username, password } = req.body;


  try {
    await UserModel.register({ username, active: true }, password);;
    res.redirect('/connexion');
  } catch (error) {
    return res.status(400).send({
      message: "Failed to add user."
    });
  }
});

export default router;