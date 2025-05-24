import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";

import db from "../config/db.js";

passport.use(
  new Strategy(async function verify(email, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email =$1", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.log("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              req.flash("error", "Incorrect password");
              return cb(null, false);
            }
          }
        });
      } else {
        req.flash("error", "User not found");
        return cb("User not found");
      }
    } catch (err) {
      console.log("Error verifying user:", err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
