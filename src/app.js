const express = require('express');
const booksRouter = require('./routes/books');

const app = express();

app.use(express.json());

app.use('/books', booksRouter);
app.use('/', booksRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
