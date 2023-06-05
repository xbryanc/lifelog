import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User, { IUser } from "./models/user";

// set up passport configs
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne(
        {
          googleid: profile.id,
        },
        function (err: any, user: IUser) {
          if (err) return done(err);

          if (!user) {
            user = new User({
              name: profile.displayName,
              googleid: profile.id,
            });

            user.save(function (err: any) {
              if (err) console.log(err);

              return done(err, user);
            });
          } else {
            return done(err, user);
          }
        }
      );
    }
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

export default passport;
