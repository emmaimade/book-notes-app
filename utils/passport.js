import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";

import db from "../config/db.js";

passport.use(
  new Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function verify(email, password, cb) {
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
                return cb(null, false, { message: "Incorrect password" });
              }
            }
          });
        } else {
          return cb(null, false, { message: "User not found" });
        }
      } catch (err) {
        console.log("Error verifying user:", err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const { rows } = await db.query(
      "SELECT id, email FROM users WHERE id = $1",
      [id]
    );
    cb(null, rows[0] || false);
  } catch (err) {
    console.log("Error deserializing user:", err);
    cb(err);
  }
});
