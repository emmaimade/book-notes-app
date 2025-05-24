import express from "express";
import bodyParser from "body-parser";
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import pgSession from "connect-pg-simple";
import flash from "express-flash";

import db from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import { setUser, ensureAuth } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT;
const PgStore = pgSession(session)

app.use(session({
  store: new PgStore({
    pool: db,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 48
  }
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressEjsLayouts);
app.set('layout', 'layout');

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(setUser);

app.use("/", authRoutes);

// home endpoint
// app.get("/", async (req, res) => {
    
// })

// // get book cover
// app.get("/book-cover/:isbn", async (req, res) => {

// });

// // get books by sort
// app.get("/books", async (req, res) => {
    
// })

// // get add book page
// app.get("/books/add", (req, res) => {
    
// })

// // get edit book page
// app.get("/books/edit/:id", async (req, res) => {
    
// });

// // get book details
// app.get("/books/:id", async (req, res) => {
    
// })

// // add book
// app.post("/add", async (req, res) => {
    
// });

// // edit book
// app.post("/books/:id", async (req, res) => {
    
// });

// // delete book
// app.post("/books/delete/:id", async (req, res) => {
  
// })

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});