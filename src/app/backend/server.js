const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Verbindungskonfiguration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'addressbook',
  password: 'pg',
  port: 5432,
});

// GET: Alle Adressen abrufen
app.get('/api/addresses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM addresses ORDER BY last_name ASC');
    // Konvertiert snake_case aus DB in camelCase für Angular
    const addresses = result.rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      street: row.street,
      city: row.city,
      zipCode: row.zip_code,
    }));
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Neue Adresse erstellen
app.post('/api/addresses', async (req, res) => {
  const { firstName, lastName, email, phone, street, city, zipCode } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO addresses (first_name, last_name, email, phone, street, city, zip_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [firstName, lastName, email, phone, street, city, zipCode],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Adresse aktualisieren
app.put('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, street, city, zipCode } = req.body;
  try {
    await pool.query(
      `UPDATE addresses SET first_name=$1, last_name=$2, email=$3, phone=$4, street=$5, city=$6, zip_code=$7
       WHERE id=$8`,
      [firstName, lastName, email, phone, street, city, zipCode, id],
    );
    res.json({ message: 'Adresse aktualisiert' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Adresse löschen
app.delete('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM addresses WHERE id = $1', [id]);
    res.json({ message: 'Adresse gelöscht' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Backend läuft auf http://localhost:3000'));
