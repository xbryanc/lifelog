// dependencies
import _ from "lodash";
import express from "express";
import connect from "connect-ensure-login";
import User, { IUser } from "../models/user";
import Diary from "../models/diary";
import Finance from "../models/finance";
import { Diary as DiaryType, FinanceLog } from "../../defaults";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

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
  await User.updateOne({ _id: req.user._id }, { diary: {}, finance: {} });
  res.send(user);
});

router.get("/all_years", async (req, res) => {
  const diaries = await Diary.find({ user: req.user._id });
  const finances = await Finance.find({ user: req.user._id });
  res.send(
    _.uniq([
      ...diaries.map((diary) => diary.year),
      ...finances.map((finance) => finance.year),
    ])
  );
});

router.get("/diary", async (req, res) => {
  res.send(
    (await Diary.getDiaryForUser(req.user._id, req.query.year as string))
      ?.diary ?? {}
  );
});

router.get("/finance", async (req, res) => {
  res.send(
    (await Finance.getFinanceForUser(req.user._id, req.query.year as string))
      ?.finance ?? {}
  );
});

router.get("/echo", function (req, res) {
  res.send({ message: req.query.message });
});

router.post("/save_info", connect.ensureLoggedIn(), async (req, res) => {
  const diary: DiaryType = req.body.diary;
  const diaryEntries = _.groupBy(
    Object.entries(diary).filter(
      ([key]) => !Number.isNaN(Number.parseInt(key))
    ),
    ([key]) => _.last(key.split("/"))
  );
  for (const [year, val] of Object.entries(diaryEntries)) {
    let curEntry = await Diary.getDiaryForUser(req.user._id, year);
    if (!curEntry) {
      curEntry = await Diary.create({ user: req.user._id, year, diary: {} });
    }
    curEntry.diary = {
      ...curEntry.diary,
      ...Object.fromEntries(val),
    };
    await curEntry.save();
  }

  const finance: FinanceLog = req.body.finance;
  const financeEntries = _.groupBy(
    Object.entries(finance).filter(
      ([key]) => !Number.isNaN(Number.parseInt(key))
    ),
    ([key]) => _.last(key.split("/"))
  );
  for (const [year, val] of Object.entries(financeEntries)) {
    let curEntry = await Finance.getFinanceForUser(req.user._id, year);
    if (!curEntry) {
      curEntry = await Finance.create({
        user: req.user._id,
        year,
        finance: {},
      });
    }
    curEntry.finance = {
      ...curEntry.finance,
      ...Object.fromEntries(val),
    };
    await curEntry.save();
  }

  await User.updateOne(
    { _id: req.user._id },
    {
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
