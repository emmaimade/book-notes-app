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

// home endpoint
app.get("/", async (req, res) => {
    books = await getBooks();

    //handle no books
    if (books.length === 0) {
      return res.status(404).render("error", { message: "No books found" });
    }

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

// get add book page
app.get("/books/add", (req, res) => {
    res.render("books/add.ejs")
})

// get book details
app.get("/books/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);

        // Handle book not found
        if (result.rows.length === 0) {
          return res.status(404).render("error", { message: "Book not found" });
        }
        
        res.render("books/detail.ejs", { book: result.rows[0] });
    } catch (error) {
      console.log(error);
    }
})

// add book
app.post("/add", async (req, res) => {
    try {
      const {title, author, isbn, summary, notes, rating, date_read} = req.body;

      if (!title || !author || !isbn || !date_read) {
        return res.status(400).render("error", { message: "Missing required fields" });
      }

      await db.query(
        "INSERT INTO books (title, author, isbn, summary, notes, rating, date_read) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          title,
          author,
          isbn,
          summary || null,
          notes || null,
          rating || null,
          date_read,
        ]
      );

      res.redirect("/");
    } catch (error) {
      console.log(error);
      res.status(500).render("error", { message: "Error adding book" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})