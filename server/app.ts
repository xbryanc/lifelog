// libraries
import { Server } from "http";
import { urlencoded, json } from "body-parser";
import session from "express-session";
import express, { Request, Response } from "express";
import path from "path";
import User from "./models/user";

// env setup
const dotenv = require("dotenv");
dotenv.config();

// local dependencies
import passport from "./passport";
import api from "./routes/api";

// initialize express app
const app = express();
const publicPath = path.join(__dirname, "../client/public");

// set POST request body parser
app.use(urlencoded({ extended: false, limit: "50mb" }));
app.use(json({ limit: "50mb" }));

// set up sessions
app.use(
  session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.enable("trust proxy");

// hook up passport
app.use(passport.initialize());
app.use(passport.session());

// authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/home");
  }
);

app.get("/logout", function (req, res) {
  req.logout(() => {});
  res.redirect("/");
});

app.use("/api", api);
app.use(express.static(publicPath));

app.get(["/", "/home", "/profile"], function (req, res) {
  res.sendFile(path.join(publicPath, "index.html"));
});

// 404 route
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  next(err);
});

// route error handler
app.use(function (err: any, req: Request, res: Response) {
  res.status(err.status || 500);
  res.send({
    status: err.status,
    message: err.message,
  });
});

// port config
const port = process.env.PORT || 3000; // config variable

let server = new Server(app);

server.listen(port, function () {
  console.log("Server running on port: " + port);
});
