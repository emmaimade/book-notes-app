import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import dotenv from "dotenv";

dotenv.config()

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
app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})