# Book Notes - Track Your Reading Journey

**Book Notes** is a personal reading journal web application built with Node.js, Express, PostgreSQL, and EJS. Users can register, log in, and securely manage their own book notes—including titles, authors, summaries, ratings, and read dates.

## Features

* 🔒 **User Authentication**: Register, log in, and log out via Passport.js with secure password hashing (bcrypt).
* ✍️ **CRUD Operations**: Create, read, update, and delete book entries tied to each user.
* 📱 **Responsive UI**: Mobile-friendly design using Bootstrap 5 and EJS layouts.
* 💾 **Session Persistence**: Sessions stored in PostgreSQL via connect-pg-simple, so users stay signed in across restarts.
* 📖 **Manage Details**: Add books with title, author, ISBN, summary, and personal notes.
* ⭐ **5-Star Rating**: Rate books using a 5-star system (supports half-star ratings).
* 📅 **Reading Dates**: Track reading dates with DD/MM/YYYY format.
* 🌄 **Cover Retrieval**: Automatic book cover retrieval using Open Library API.
* 🔍 **Search & Filter**: Search and filter books by title, author, or rating.
* ✏️ **Partial Updates**: Edit existing entries with only the changed fields.
* 🗑️ **Safe Delete**: Delete entries with a confirmation dialog.

## Tech Stack

**Frontend:** EJS | Bootstrap 5 | Vanilla JavaScript

**Backend:** Node.js | Express | PostgreSQL | Passport.js

**APIs:** [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)

## Installation

### Prerequisites

* PostgreSQL
* Node.js v16+
* A modern web browser

### Setup Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/emmaimade/book-notes-app.git
   cd book-notes-app
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create the database and tables:

   ```sql
   CREATE DATABASE book_notes;

   \c book_notes;
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     firstname VARCHAR(50),
     lastname VARCHAR(50),
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE books (
     id SERIAL PRIMARY KEY,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     author VARCHAR(255) NOT NULL,
     isbn VARCHAR(20),
     summary TEXT,
     notes TEXT,
     rating DECIMAL(3,1) CHECK (rating BETWEEN 0 AND 5),
     date_read DATE NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
4. Create a `.env` file in the project root:

   ```env
   PG_USER=<your_pg_user>
   PG_HOST=localhost
   PG_DATABASE=book_notes
   PG_PASSWORD=<your_pg_password>
   PG_PORT=5432
   PORT=3000
   SESSION_SECRET=<a_random_secret>
   ```
5. Start the server:

   ```bash
   npm start
   ```
6. Open your browser and visit `http://localhost:3000`.

## Project Structure

```
book-notes-app/
├── config/
│   └── db.js              # PostgreSQL pool config
├── controllers/
│   ├── authController.js
│   └── bookController.js
├── middleware/
│   └── auth.js            # setUser & ensureAuth
├── routes/
│   ├── authRoute.js
│   └── booksRoute.js
├── utils/
│   └── passport.js        # Passport strategy setup
├── views/
│   ├── partials/
│   │   ├── footer.ejs
│   │   ├── header.ejs
│   │   └── book-card.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── books/
│   │   ├── list.ejs
│   │   ├── add.ejs
│   │   ├── edit.ejs
│   │   └── detail.ejs
│   ├── index.ejs
│   ├── layout.ejs
│   └── error.ejs
├── public/
│   ├── css/
│   └── images/
├── .env
├── package.json
└── README.md
```

## Usage

* **Add a Book:** Click **Add Book**, fill in details, and submit.
* **View Details:** Click a book to see full summary, notes, and rating.
* **Edit:** Click **Edit** on a book detail page to modify any fields.
* **Delete:** Click **Delete** and confirm to remove a book.

## Acknowledgments

- [Angela Yu](https://www.udemy.com/user/4b4368a3-b5c8-4529-aa65-2056ec31f37e/) for her exceptional Full-Stack Web Development curriculum that inspired this project
- Open Library for their excellent book data API
- Bootstrap for responsive UI components
- Font Awesome for icons

## License

This project is licensed under the MIT License.
