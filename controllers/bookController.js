import axios from "axios";

import db from "../config/db.js";
import "../utils/passport.js";

export const getBooks = async (req, res) => {
  try {
    const sort = req.query.sort;
    let baseSql = "SELECT * FROM books WHERE user_id = $1";

    if (sort === "rating") {
      baseSql += " ORDER BY rating DESC";
    } else if (sort === "date_read") {
      baseSql += " ORDER BY date_read DESC";
    } else if (sort === "title") {
      baseSql += " ORDER BY title ASC";
    }

    const result = await db.query(baseSql, [req.user.id]);

    //handle no books
    if (result.rows.length === 0) {
      return res.render("index");
    }

    res.render("books/list.ejs", { books: result.rows });
  } catch (err) {
    res.status(500).render("error", { message: "Internal Server Error" });
  }
};

// get add book page
export const getAddBook = async (req, res) => {
  res.render("books/add.ejs");
};

// get book cover
export const getBookCover = async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const response = await axios.get(
      `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
      { responseType: "stream" }
    );
    res.set("Content-Type", "image/jpeg");
    response.data.pipe(res);
  } catch (error) {
    console.log(error);
  }
};

//get edit book page
export const getEditBook = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      "SELECT * FROM books WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    res.render("books/edit.ejs", { book: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
};

// get book details
export const getBookDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query(
      "SELECT * FROM books WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    // Handle book not found
    if (result.rows.length === 0) {
      req.flash("error", "Book not found");
      return res.status(404).render("error", { message: "Book not found" });
    }

    res.render("books/detail.ejs", { book: result.rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).res.render("error", { message: "Internal Server Error" });
  }
};

// add book
export const addBook = async (req, res) => {
  try {
    const { title, author, isbn, summary, notes, date_read } = req.body;
    let rating = req.body.rating;

    if (!title || !author || !isbn || !date_read) {
      req.flash("error", "Missing required fields");
      return res
        .status(400)
        .render("error", { message: "Missing required fields" });
    }

    rating = parseFloat(rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      req.flash("error", "Invalid rating");
      return res.status(400).render("error", { message: "Invalid rating" });
    }

    await db.query(
      "INSERT INTO books (title, author, isbn, summary, notes, rating, date_read, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        title,
        author,
        isbn,
        summary || null,
        notes || null,
        rating || null,
        date_read,
        req.user.id,
      ]
    );

    res.redirect("/books");
  } catch (error) {
    console.log(error);
    res.status(500).render("error", { message: "Error adding book" });
  }
};

// edit book
export const editBook = async (req, res) => {
  try {
    const id = req.params.id;
    const newData = req.body;

    const currentBook = await db.query(
      "SELECT * FROM books WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (currentBook.rows.length === 0) {
      req.flash("error", "Book not found");
      return res.status(404).render("error", { message: "Book not found" });
    }

    const changes = {};
    const current = currentBook.rows[0];

    if (newData.title && newData.title !== current.title)
      changes.title = newData.title;
    if (newData.author && newData.author !== current.author)
      changes.author = newData.author;
    if (newData.isbn && newData.isbn !== current.isbn)
      changes.isbn = newData.isbn;

    // date handling
    if (newData.date_read) {
      const currentDateISO = new Date(current.date_read)
        .toISOString()
        .split("T")[0];
      if (newData.date_read !== currentDateISO) {
        changes.date_read = newData.date_read;
      }
    }

    if (newData.summary != current.summary)
      changes.summary = newData.summary || null;
    if (newData.notes !== current.notes) changes.notes = newData.notes || null;
    if (newData.rating !== current.rating)
      changes.rating = newData.rating || null;

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
          WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        `;

      // add id to values
      values.push(id, req.user.id);

      await db.query(query, values);
    }

    res.redirect("/books/:id");
  } catch (error) {
    console.log("Update error:", error);
    req.flash("error", "Failed to update book");
    res.status(500).render("error", { message: "Failed to update book" });
  }
};

// delete book
export const deleteBook = async (req, res) => {
  try {
    const id = req.params.id;

    const book = await db.query(
      "SELECT id FROM books WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (!book.rows[0]) {
      req.flash("error", "Book not found");
      return res.status(404).render("error", { message: "Book not found" });
    }

    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/books");
  } catch (error) {
    console.log("Delete Error:", error);
    req.flash("error", "Failed to delete book");
    res.status(500).render("error", { message: "Failed to delete book" });
  }
};
