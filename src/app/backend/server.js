const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Verbindungspool zur PostgreSQL-Datenbank herstellen
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'pg',
  port: 5432,
});
// WICHTIG: Setzt das Schema "addressbook" automatisch für alle Abfragen im Pool
pool.on('connect', (client) => {
  client
    .query('SET search_path TO addressbook, public')
    .catch((err) => console.error('❌ Fehler beim Setzen des Schemas (search_path):', err.message));
});

// Teste die Datenbankverbindung beim Serverstart
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Fehler bei der Verbindung zu PostgreSQL:', err.stack);
  }
  console.log('✅ Erfolgreich mit der DB "postgres" im Schema "addressbook" verbunden!');
  release();
});

// GET: Alle Adressen abrufen mit Pagination & Sorting
app.get('/api/addresses', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const offset = (page - 1) * limit;

    const allowedSortFields = {
      firstName: 'first_name',
      lastName: 'last_name',
      city: 'city',
      category: 'category',
    };
    const sortColumn = allowedSortFields[req.query.sort] || 'last_name';
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    let whereClauses = [];
    let queryValues = [];
    let paramIndex = 1;

    const filterMappings = {
      filterFirstName: 'first_name',
      filterLastName: 'last_name',
      filterCity: 'city',
      filterCategory: 'category',
    };

    for (const [queryParam, dbColumn] of Object.entries(filterMappings)) {
      const val = req.query[queryParam];
      if (val && val.trim() !== '') {
        if (queryParam === 'filterCategory') {
          whereClauses.push(`${dbColumn} = $${paramIndex}`);
          queryValues.push(val.trim());
        } else {
          whereClauses.push(`${dbColumn} ILIKE $${paramIndex}`);
          queryValues.push(`%${val.trim()}%`);
        }
        paramIndex++;
      }
    }

    const whereString =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : 'WHERE 1=1';

    const countQuery = `SELECT COUNT(*) FROM addresses ${whereString}`;
    const countResult = await pool.query(countQuery, queryValues);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    console.log(`📊 DB-Count berechnet: ${totalItems} Einträge gesamt.`);

    const dataQuery = `
      SELECT
        id, first_name AS "firstName", last_name AS "lastName",
        email, phone, street, city, state, zip_code AS "zipCode",
        country, category, birthday
      FROM addresses
      ${whereString}
      ORDER BY ${sortColumn} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const finalValues = [...queryValues, limit, offset];
    const result = await pool.query(dataQuery, finalValues);

    return res.json({
      data: result.rows,
      total: totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    console.error('❌ Fehler in GET /api/addresses mit Spaltenfilter:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// POST: Neue Adresse hinzufügen (FIX: Cast auf Text für flexible Geburtstage)
app.post('/api/addresses', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    street,
    city,
    state,
    zipCode,
    country,
    category,
    birthday,
  } = req.body;

  console.log('Empfangene Daten im Backend POST:', req.body);

  try {
    // 🔥 FIX: Expliziter Cast auf ::text für den Fall, dass die Tabellenspalte flexiblen Text erwartet.
    const result = await pool.query(
      `INSERT INTO addresses (first_name, last_name, email, phone, street, city, state, zip_code, country, category, birthday)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text) RETURNING id`,
      [
        firstName,
        lastName,
        email,
        phone,
        street,
        city,
        state,
        zipCode,
        country,
        category,
        birthday || null,
      ],
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    console.error('❌ CRITICAL DB ERROR IN POST:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Adresse aktualisieren (FIX: Typ-Casting für ID und Birthday)
app.put('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    email,
    phone,
    street,
    city,
    state,
    zipCode,
    country,
    category,
    birthday,
  } = req.body;

  console.log('Empfangene Daten im Backend PUT:', req.body);
  try {
    // 🔥 FIX: $11::text gecastet und die ID-Bedingung auf WHERE id = $12::uuid angepasst
    await pool.query(
      `UPDATE addresses SET first_name=$1, last_name=$2, email=$3, phone=$4, street=$5, city=$6, state=$7, zip_code=$8, country=$9, category=$10, birthday=$11::text WHERE id=$12::uuid`,
      [
        firstName,
        lastName,
        email,
        phone,
        street,
        city,
        state,
        zipCode,
        country,
        category,
        birthday || null,
        id,
      ],
    );
    res.status(200).json({});
  } catch (err) {
    console.error('❌ CRITICAL DB ERROR IN PUT:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Adresse löschen
app.delete('/api/addresses/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`📥 Backend: DELETE-Anfrage für ID: ${id}`);

  if (!id || id === 'undefined') {
    console.error('❌ Fehler: Keine gültige ID übergeben!');
    return res.status(400).json({ error: 'Ungültige oder fehlende ID' });
  }

  try {
    const queryText = 'DELETE FROM addresses WHERE id = $1::uuid';
    const result = await pool.query(queryText, [id]);

    if (result.rowCount === 0) {
      console.log(`⚠️ Keine Adresse mit der ID ${id} in der Datenbank gefunden.`);
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }

    console.log(`✅ Eintrag ${id} erfolgreich aus PostgreSQL gelöscht.`);
    return res.status(200).json({});
  } catch (err) {
    console.error(`❌ ECHTER DB-FEHLER in DELETE /api/addresses/${id}:`, err.message);
    if (res.headersSent) {
      return;
    }
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Backend läuft auf http://localhost:3000'));
