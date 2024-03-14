import http from "http";
import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import "./config/mongo.js";
import indexRouter from "./routes/index.js";
import webSockets from "./utils/WebSockets.js";
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';  // session middleware
import passport from 'passport';  // authentication
import UserModel from "./models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const io = new Server()

const app = express();
app.use(session({
  secret: 'r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 24 * 1000 } // 1 hour
}));


const port = process.env.PORT || "3000";
app.set("port", port);

app.use(express.static(__dirname + '/public'));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

app.use("/", indexRouter);

app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint doesnt exist'
  })
});

const server = http.createServer(app);

server.listen(port);

io.listen(server);
io.on('connection', webSockets.connection)

server.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${port}/`)
});