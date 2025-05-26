import express from 'express';
import { getBooks, getAddBook, getBookCover , getEditBook, getBookDetails, addBook, editBook, deleteBook } from '../controllers/bookController.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', ensureAuth, getBooks); // list & sort
router.get('/add', ensureAuth, getAddBook);
router.get('/edit/:id', ensureAuth, getEditBook);
router.get('/:id', ensureAuth, getBookDetails);
router.get('/cover/:isbn', ensureAuth, getBookCover);
router.post('/add', ensureAuth, addBook);
router.post('/:id', ensureAuth, editBook);
router.post('/delete/:id', ensureAuth, deleteBook);

export default router;