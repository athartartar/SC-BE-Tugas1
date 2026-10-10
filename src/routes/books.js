const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, author, year, stock } = req.body;
    if (!title || !author) {
      return res.status(400).json({ message: 'title and author are required' });
    }
    const result = await pool.query(
      'INSERT INTO books (title, author, year, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, author, year ?? null, stock ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, author, year, stock } = req.body;
    const existing = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const current = existing.rows[0];
    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, year = $3, stock = $4 WHERE id = $5 RETURNING *',
      [
        title ?? current.title,
        author ?? current.author,
        year !== undefined ? year : current.year,
        stock !== undefined ? stock : current.stock,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
