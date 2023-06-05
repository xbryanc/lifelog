// dependencies
import express from "express";
import connect from "connect-ensure-login";

import User from "../models/user";

const router = express.Router();

router.get("/whoami", function (req, res) {
  if (req.isAuthenticated()) {
    res.send({ _id: req.user._id });
  } else {
    res.send({});
  }
});

router.get("/user", async (req, res) => {
  const user = await User.findOne({ _id: req.query._id as string });
  res.send(user);
});

router.get("/echo", function (req, res) {
  res.send({ message: req.query.message });
});

router.post("/save_info", connect.ensureLoggedIn(), async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    {
      diary: req.body.diary,
      finance: req.body.finance,
      tags: req.body.tags,
      subscriptions: req.body.subscriptions,
    }
  );
  res.status(200).json({});
});

router.post("/save_profile", connect.ensureLoggedIn(), async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { subscriptions: req.body.subscriptions, goals: req.body.goals }
  );
  return res.status(200).json({});
});

export default router;
