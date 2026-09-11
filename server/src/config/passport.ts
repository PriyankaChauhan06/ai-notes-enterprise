import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/User";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

if (!clientID || !clientSecret || !callbackURL) {
  throw new Error("Google OAuth environment variables are not configured");
}

passport.use(
  new GoogleStrategy(
    { clientID, clientSecret, callbackURL },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        if (!email) {
          return done(new Error("Google account email not available"));
        }

        let user = await User.findOne({ googleId });
        if (!user) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = googleId;
            await user.save();
          } else {
            user = await User.create({ name, email, googleId });
          }
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);

export default passport;
