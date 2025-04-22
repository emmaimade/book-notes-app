import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from 'pg';
import dotenv from "dotenv";
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_notes",
  password: process.env.dbPassword,
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressEjsLayouts);
app.set('layout', 'layout');

let books = [];

async function getBooks() {
    const result = await db.query("SELECT * FROM books");
    return result.rows
}

app.get("/", async (req, res) => {
    books = await getBooks();
    res.render("books/list.ejs", { books })
})

// get book cover
app.get("/book-cover/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const response = await axios.get(
      `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
      {responseType: 'stream'}
    );
    res.set('Content-Type', 'image/jpeg');
    response.data.pipe(res);
  } catch (error) {
    console.log(error)
  }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})