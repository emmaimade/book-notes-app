import express, { response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from 'pg';
import dotenv from "dotenv";
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import e from "express";

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

// home endpoint
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

// get books by sort
app.get("/books", async (req, res) => {
    try {
        const sort = req.query.sort;

        if (sort === "rating") {
          const result = await db.query("SELECT * FROM books ORDER BY rating DESC");
          const books = result.rows;

          return res.render("books/list.ejs", { books });
        }

        if (sort === "date_read") {
          const result = await db.query("SELECT * FROM books ORDER BY date_read DESC");
          const books = result.rows;

          return res.render("books/list.ejs", { books });
        }
    } catch (error) {
        console.log(error)
    }
})

// get book details
app.get("/books/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
        const [book] = result.rows
        console.log(book)
        
        res.render("books/detail.ejs", { book });
    } catch (error) {
      console.log(error)
    }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})