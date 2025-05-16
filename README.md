# Book Notes - Track Your Reading Journey

A web application to track books you've read, with notes, ratings, and automatic cover retrieval.

## Features

- 📖 Add books with title, author, ISBN, summary, and personal notes
- ⭐ Rate books using 5-star system (supports half-star ratings)
- 📅 Track reading dates with DD/MM/YYYY format
- 🌄 Automatic book cover retrieval using Open Library API
- 🔍 Search and filter books by title, author, or rating
- ✏️ Edit existing entries with partial updates
- 🗑️ Safe delete with confirmation dialog
- 📱 Responsive design works on all devices

## Tech Stack

**Frontend:**  
EJS | Bootstrap 5 | JavaScript

**Backend:**  
Node.js | Express | PostgreSQL

**APIs:**  
[Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)

## Installation

### Prerequisites
- PostgreSQL
- Node.js v16+
- npm

### Setup
1. Clone the repository:
```bash
git clone https://github.com/emmaimade/book-notes-app.git
cd book-notes-app
```

2. Install dependencies:
```bash
npm install
```

3. Database setup:
```sql
CREATE DATABASE book_notes;
\c book_notes
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
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

4. Create `.env` file:
```env
PG_USER=
PG_HOST=
PG_DATABASE=
PG_PASSWORD=
PG_PORT=
PORT=
```

5. Start the server:
```bash
npm start
```

Visit `http://localhost:3000` in your browser!

## Usage

### Adding a Book
1. Click "+ Add Book" in navigation
2. Fill in required fields (Title, Author, ISBN, Date Read)
3. Add optional details (Rating, Summary, Notes)
4. Submit form

### Viewing Details
- Click any book card to see full details
- View star rating, full summary, and notes
- See book cover (automatically retrieved via ISBN)

### Editing Entries
1. Click "Edit" on book details page
2. Modify any fields (only changed fields will update)
3. Save changes

### Deleting Books
1. Click "Delete" on book details page
2. Confirm deletion in dialog
3. Automatically redirected to book list

## API Reference

| Endpoint           | Method | Description                     |
|--------------------|--------|---------------------------------|
| /books             | GET    | Get all books (supports sorting)|
| /books/:id         | GET    | Get single book details         |
| /books/add         | GET    | Display add book form           |
| /books/edit/:id    | GET    | Display edit book form          |
| /books             | POST   | Create new book entry           |
| /books/:id         | POST   | Partial update book details     |
| /books/delete/:id  | POST   | Delete a book                   |
| /book-cover/:isbn  | GET    | Book cover proxy endpoint       |


## Acknowledgments

- [Angela Yu](https://www.udemy.com/user/4b4368a3-b5c8-4529-aa65-2056ec31f37e/) for her exceptional Full-Stack Web Development curriculum that inspired this project
- Open Library for their excellent book data API
- Bootstrap for responsive UI components
- Font Awesome for icons
