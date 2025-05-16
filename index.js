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
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
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

        if (sort === "title") {
          const result = await db.query("SELECT * FROM books ORDER BY title ASC");
          const books = result.rows;

          return res.render("books/list.ejs", { books });
        }
    } catch (error) {
        console.log(error)
        res.status(500).res.render("error", { message: "Internal Server Error" });
    }
})

// get add book page
app.get("/books/add", (req, res) => {
    res.render("books/add.ejs")
})

// get edit book page
app.get("/books/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
        res.render("books/edit.ejs", { book: result.rows[0] });
    } catch (error) {
        console.log(error)
        res.status(500).res.render("error", { message: "Internal Server Error" });
    }
});

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
      res.status(500).res.render("error", { message: "Internal Server Error" });
    }
})

// add book
app.post("/add", async (req, res) => {
    try {
      const {title, author, isbn, summary, notes, date_read} = req.body;
      let rating = req.body.rating;

      if (!title || !author || !isbn || !date_read) {
        return res.status(400).render("error", { message: "Missing required fields" });
      }

      rating = parseFloat(rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return res.status(400).render("error", { message: "Invalid rating" });
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

// edit book
app.post("/books/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const newData = req.body;
  
      const currentBook = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  
      if (currentBook.rows.length === 0) {
        return res.status(404).render("error", { message: "Book not found" });
      }
  
      const changes = {};
      const current = currentBook.rows[0];
  
      if (newData.title && newData.title !== current.title) changes.title = newData.title;
      if (newData.author && newData.author !== current.author) changes.author = newData.author;
      if (newData.isbn && newData.isbn !== current.isbn) changes.isbn = newData.isbn;

      // date handling
      if (newData.date_read) {
        const currentDateISO = new Date(current.date_read).toISOString().split('T')[0];
        if (newData.date_read !== currentDateISO) {
          changes.date_read = newData.date_read;
        }
      }
  
      if (newData.summary != current.summary) changes.summary = newData.summary || null;
      if (newData.notes !== current.notes) changes.notes = newData.notes || null;
      if (newData.rating !== current.rating) changes.rating = newData.rating || null;

      if (Object.keys(changes).length > 0) {
        const setClauses = [];
        const values = [];
        let paramIndex = 1;
  
        for (const [key, value] of Object.entries(changes)) {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
  
        const query = `
          UPDATE books 
          SET ${setClauses.join(", ")} 
          WHERE id = $${paramIndex}
        `;
        
        // add id to values
        values.push(id);
  
        await db.query(query, values);
      }
  
      res.redirect(`/books/${id}`);
    } catch (error) {
      console.log("Update error:", error);
      res.status(500).render("error", { message: "Failed to update book" });
    }
});

// delete book
app.post("/books/delete/:id", async (req, res) => {
  try {
      const id = req.params.id

      const book = await db.query("SELECT id FROM books WHERE id = $1", [id]);
      if (!book.rows[0]) {
        return res.status(404).res.render("error", { message: "Book not found" });
      }

      await db.query("DELETE FROM books WHERE id = $1", [id]);
      res.redirect('/');
  } catch (error) {
    console.log("Delete Error:", error);
    res.status(500).res.redirect("error", { message: "Failed to delete book" });
  }
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});