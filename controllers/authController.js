import bcrypt from "bcrypt";
import passport from "passport";

import db from "../config/db.js";
import "../utils/passport.js";

const saltRounds = 10;

// get home page
export const getHome = async (req, res) => {
    res.render("index.ejs");
}

// get register page
export const getRegister = async (req, res) => {
  res.render("auth/register.ejs");
};

// get login page
export const getLogin = async (req, res) => {
  res.render("auth/login.ejs");
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/auth/login");
  });
};

// register
export const register = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    // checks if user exist
    if (checkResult.rows.length > 0) {
      req.flash("error", "User already exist. Try logging in");
      res.render("auth/register.ejs");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            if (err) console.log(err);
            res.redirect("/books");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// login
export const login = passport.authenticate("local", {
    successRedirect: "/books",
    failureRedirect: "/auth/login",
    failureFlash: true
});
