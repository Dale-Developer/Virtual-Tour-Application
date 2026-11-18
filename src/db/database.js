import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { SEED_DESTINATIONS } from './seed';
import { CATEGORIES, PROVINCES } from '../theme';

/*
 * DATABASE SCHEMA (matches the project's design document)
 *
 *  users            user_id PK, first_name, last_name, username UNIQUE, password_hash,
 *                   role ('Admin' | 'Tourist'), created_at
 *  destinations     destination_id PK, destination_name, description, destination_address,
 *                   category (enum), image, latitude, longitude, panorama_asset,
 *                   created_by FK -> users, created_at, updated_at
 *  quiz_questions   quiz_id PK, destination_id FK, question, options (JSON array),
 *                   correct_answer (index 0-3 into options), explanation
 *  user_progress    progress_id PK, user_id FK, destination_id FK, quiz_score, quiz_total, completed_at
 *
 *  session          small helper table (not part of the design) that remembers who is logged in.
 *  app_settings     small key/value helper table (not part of the design); stores the custom app logo.
 */

let dbPromise = null;
export const getDB = () => {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('calabarzon_tour_v2.db');
  return dbPromise;
};

export const hashPassword = (pw) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `calabarzon:${pw}`);

export const PASSING_PERCENT = 60;

const parseJSON = (v, fallback) => {
  try {
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

/** The schema has no province column, so it is read from the end of the address ("…, Calamba City, Laguna"). */
export function provinceOf(address = '') {
  const parts = address.split(',').map((s) => s.trim().toLowerCase()).reverse();
  for (const part of parts) {
    const hit = PROVINCES.find((p) => part.includes(p.toLowerCase()));
    if (hit) return hit;
  }
  return null;
}

/* Column aliases keep the screens simple (id, name, address) while the tables use the design-doc names. */
const DEST_SELECT = `
  SELECT destination_id AS id, destination_name AS name, description,
         destination_address AS address, category, image, latitude, longitude,
         panorama_asset, created_by, created_at, updated_at
  FROM destinations`;

const USER_SELECT = `
  SELECT user_id AS id, first_name, last_name, first_name || ' ' || last_name AS name, username, role
  FROM users`;

const mapDestination = (r) => (r ? { ...r, province: provinceOf(r.address) } : null);
const mapQuestion = (r) => (r ? { ...r, options: parseJSON(r.options, []) } : null);

/* ------------------------------------------------------------------ */
/* Setup                                                               */
/* ------------------------------------------------------------------ */
export async function initDB() {
  const db = await getDB();
  const categoryList = CATEGORIES.map((c) => `'${c}'`).join(', ');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Tourist' CHECK (role IN ('Admin', 'Tourist')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
      destination_id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_name TEXT NOT NULL,
      description TEXT NOT NULL,
      destination_address TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN (${categoryList})),
      image TEXT,
      latitude REAL,
      longitude REAL,
      panorama_asset TEXT,
      created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      quiz_id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
      explanation TEXT
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      destination_id INTEGER NOT NULL REFERENCES destinations(destination_id) ON DELETE CASCADE,
      quiz_score INTEGER NOT NULL,
      quiz_total INTEGER NOT NULL CHECK (quiz_total > 0),
      completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS session (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  let admin = await db.getFirstAsync("SELECT user_id FROM users WHERE role = 'Admin' LIMIT 1");
  if (!admin) {
    const pw = await hashPassword('admin123');
    const res = await db.runAsync(
      "INSERT INTO users (first_name, last_name, username, password_hash, role) VALUES (?, ?, ?, ?, 'Admin')",
      ['Site', 'Administrator', 'admin', pw]
    );
    admin = { user_id: res.lastInsertRowId };
  }

  const count = await db.getFirstAsync('SELECT COUNT(*) AS c FROM destinations');
  if (count.c === 0) await seedDestinations(admin.user_id);
}

export async function seedDestinations(createdBy) {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    for (const d of SEED_DESTINATIONS) {
      const res = await db.runAsync(
        `INSERT INTO destinations
          (destination_name, description, destination_address, category, image, latitude, longitude, panorama_asset, created_by)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [d.name, d.description, d.address, d.category, d.image, d.latitude, d.longitude, d.panorama, createdBy]
      );
      for (const [question, options, correct, explanation] of d.questions) {
        await db.runAsync(
          'INSERT INTO quiz_questions (destination_id, question, options, correct_answer, explanation) VALUES (?,?,?,?,?)',
          [res.lastInsertRowId, question, JSON.stringify(options), correct, explanation]
        );
      }
    }
  });
}

/** Admin tool: wipe destinations, questions and progress, then load the sample data again. */
export async function resetSampleData(adminId) {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM user_progress');
    await db.runAsync('DELETE FROM quiz_questions');
    await db.runAsync('DELETE FROM destinations');
  });
  await seedDestinations(adminId);
}

/* ------------------------------------------------------------------ */
/* Users / auth                                                        */
/* ------------------------------------------------------------------ */
export async function getUserById(id) {
  const db = await getDB();
  return db.getFirstAsync(`${USER_SELECT} WHERE user_id = ?`, [id]);
}

export async function registerUser({ first_name, last_name, username, password }) {
  const db = await getDB();
  const exists = await db.getFirstAsync('SELECT user_id FROM users WHERE username = ?', [username.trim()]);
  if (exists) throw new Error('That username is taken. Please choose another one.');
  const hash = await hashPassword(password);
  const res = await db.runAsync(
    "INSERT INTO users (first_name, last_name, username, password_hash, role) VALUES (?, ?, ?, ?, 'Tourist')",
    [first_name.trim(), last_name.trim(), username.trim(), hash]
  );
  return getUserById(res.lastInsertRowId);
}

export async function loginUser(username, password) {
  const db = await getDB();
  const hash = await hashPassword(password);
  const user = await db.getFirstAsync(`${USER_SELECT} WHERE username = ? AND password_hash = ?`, [
    username.trim(),
    hash,
  ]);
  if (!user) throw new Error('Username or password is incorrect.');
  return user;
}

export async function saveSession(userId) {
  const db = await getDB();
  await db.runAsync('INSERT OR REPLACE INTO session (key, value) VALUES (?, ?)', ['user_id', String(userId)]);
}
export async function clearSession() {
  const db = await getDB();
  await db.runAsync('DELETE FROM session WHERE key = ?', ['user_id']);
}
export async function loadSession() {
  const db = await getDB();
  const row = await db.getFirstAsync('SELECT value FROM session WHERE key = ?', ['user_id']);
  return row ? getUserById(Number(row.value)) : null;
}

/* ------------------------------------------------------------------ */
/* Destinations (CRUD + search/filter)                                 */
/* ------------------------------------------------------------------ */
export async function listDestinations({ search = '', category = 'All', province = 'All' } = {}) {
  const db = await getDB();
  const where = [];
  const args = [];
  const q = search.trim();
  if (q) {
    where.push('(destination_name LIKE ? OR description LIKE ? OR destination_address LIKE ? OR category LIKE ?)');
    const like = `%${q}%`;
    args.push(like, like, like, like);
  }
  if (category && category !== 'All') {
    where.push('category = ?');
    args.push(category);
  }
  const sql = `${DEST_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY destination_name COLLATE NOCASE`;
  let rows = (await db.getAllAsync(sql, args)).map(mapDestination);
  if (province && province !== 'All') rows = rows.filter((r) => r.province === province);
  return rows;
}

export async function getDestination(id) {
  const db = await getDB();
  return mapDestination(await db.getFirstAsync(`${DEST_SELECT} WHERE destination_id = ?`, [id]));
}

export async function getCategories() {
  const db = await getDB();
  const rows = await db.getAllAsync('SELECT DISTINCT category FROM destinations ORDER BY category');
  return rows.map((r) => r.category);
}

const num = (v) => (v === '' || v == null ? null : Number(v));

export async function createDestination(d, createdBy) {
  const db = await getDB();
  const res = await db.runAsync(
    `INSERT INTO destinations
      (destination_name, description, destination_address, category, image, latitude, longitude, panorama_asset, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      d.name.trim(), d.description.trim(), d.address.trim(), d.category,
      d.image || null, num(d.latitude), num(d.longitude), d.panorama_asset || null, createdBy,
    ]
  );
  return res.lastInsertRowId;
}

export async function updateDestination(id, d) {
  const db = await getDB();
  await db.runAsync(
    `UPDATE destinations SET destination_name=?, description=?, destination_address=?, category=?, image=?,
       latitude=?, longitude=?, panorama_asset=?, updated_at=CURRENT_TIMESTAMP
     WHERE destination_id=?`,
    [
      d.name.trim(), d.description.trim(), d.address.trim(), d.category,
      d.image || null, num(d.latitude), num(d.longitude), d.panorama_asset || null, id,
    ]
  );
}

export async function deleteDestination(id) {
  const db = await getDB();
  await db.runAsync('DELETE FROM destinations WHERE destination_id = ?', [id]);
}

/* ------------------------------------------------------------------ */
/* Quiz questions                                                      */
/* ------------------------------------------------------------------ */
const Q_SELECT = `SELECT quiz_id AS id, destination_id, question, options, correct_answer AS answer_index, explanation FROM quiz_questions`;

export async function listQuestions(destinationId) {
  const db = await getDB();
  const rows = await db.getAllAsync(`${Q_SELECT} WHERE destination_id = ? ORDER BY quiz_id`, [destinationId]);
  return rows.map(mapQuestion);
}

export async function getQuestion(id) {
  const db = await getDB();
  return mapQuestion(await db.getFirstAsync(`${Q_SELECT} WHERE quiz_id = ?`, [id]));
}

export async function createQuestion({ destination_id, question, options, answer_index, explanation }) {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO quiz_questions (destination_id, question, options, correct_answer, explanation) VALUES (?,?,?,?,?)',
    [destination_id, question.trim(), JSON.stringify(options.map((o) => o.trim())), answer_index, explanation?.trim() || null]
  );
}

export async function updateQuestion(id, { question, options, answer_index, explanation }) {
  const db = await getDB();
  await db.runAsync(
    'UPDATE quiz_questions SET question=?, options=?, correct_answer=?, explanation=? WHERE quiz_id=?',
    [question.trim(), JSON.stringify(options.map((o) => o.trim())), answer_index, explanation?.trim() || null, id]
  );
}

export async function deleteQuestion(id) {
  const db = await getDB();
  await db.runAsync('DELETE FROM quiz_questions WHERE quiz_id = ?', [id]);
}

export async function listDestinationsWithQuestionCount() {
  const db = await getDB();
  const rows = await db.getAllAsync(`
    SELECT destination_id AS id, destination_name AS name, destination_address AS address, category, image,
      (SELECT COUNT(*) FROM quiz_questions q WHERE q.destination_id = d.destination_id) AS question_count
    FROM destinations d ORDER BY destination_name COLLATE NOCASE
  `);
  return rows;
}

/* ------------------------------------------------------------------ */
/* Progress tracking (user_progress)                                   */
/* ------------------------------------------------------------------ */
/** Every submitted quiz is recorded as a row, so score history is kept. */
export async function saveQuizResult({ userId, destinationId, score, total }) {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO user_progress (user_id, destination_id, quiz_score, quiz_total) VALUES (?,?,?,?)',
    [userId, destinationId, score, total]
  );
}

/** Per-destination summary for one user. A destination is "completed" once the best
 *  quiz score reaches PASSING_PERCENT. */
export async function getProgress(userId) {
  const db = await getDB();
  const best = (col) => `(SELECT p.${col} FROM user_progress p WHERE p.user_id = ? AND p.destination_id = d.destination_id
      ORDER BY CAST(p.quiz_score AS REAL) / p.quiz_total DESC, p.progress_id DESC LIMIT 1)`;
  const rows = await db.getAllAsync(
    `SELECT d.destination_id AS id, d.destination_name AS name, d.image, d.category, d.destination_address AS address,
        (SELECT COUNT(*) FROM quiz_questions q WHERE q.destination_id = d.destination_id) AS question_count,
        (SELECT MAX(CAST(p.quiz_score AS REAL) / p.quiz_total) FROM user_progress p
           WHERE p.user_id = ? AND p.destination_id = d.destination_id) AS best_ratio,
        ${best('quiz_score')} AS best_score,
        ${best('quiz_total')} AS best_total,
        (SELECT COUNT(*) FROM user_progress p WHERE p.user_id = ? AND p.destination_id = d.destination_id) AS attempts
     FROM destinations d ORDER BY d.destination_name COLLATE NOCASE`,
    [userId, userId, userId, userId]
  );
  return rows.map((r) => {
    const completed = r.best_ratio != null && r.best_ratio * 100 >= PASSING_PERCENT;
    return { ...r, passed: completed, completed };
  });
}

export async function getProgressFor(userId, destinationId) {
  const all = await getProgress(userId);
  return all.find((p) => p.id === destinationId) || null;
}

export async function getRecentResults(userId, limit = 8) {
  const db = await getDB();
  return db.getAllAsync(
    `SELECT p.progress_id AS id, p.quiz_score AS score, p.quiz_total AS total, p.completed_at,
            d.destination_name AS destination_name
     FROM user_progress p JOIN destinations d ON d.destination_id = p.destination_id
     WHERE p.user_id = ? ORDER BY p.progress_id DESC LIMIT ?`,
    [userId, limit]
  );
}

/* ------------------------------------------------------------------ */
/* Admin reporting                                                     */
/* ------------------------------------------------------------------ */
export async function getAdminStats() {
  const db = await getDB();
  const one = async (sql) => (await db.getFirstAsync(sql)).c;
  const avg = await db.getFirstAsync('SELECT AVG(CAST(quiz_score AS REAL) / quiz_total) AS a FROM user_progress');
  return {
    destinations: await one('SELECT COUNT(*) AS c FROM destinations'),
    questions: await one('SELECT COUNT(*) AS c FROM quiz_questions'),
    tourists: await one("SELECT COUNT(*) AS c FROM users WHERE role = 'Tourist'"),
    attempts: await one('SELECT COUNT(*) AS c FROM user_progress'),
    completed: await one(`SELECT COUNT(*) AS c FROM (
      SELECT user_id, destination_id FROM user_progress GROUP BY user_id, destination_id
      HAVING MAX(CAST(quiz_score AS REAL) / quiz_total) >= ${PASSING_PERCENT / 100})`),
    avgPercent: avg.a == null ? null : Math.round(avg.a * 100),
  };
}

export async function getPopularDestinations(limit = 5) {
  const db = await getDB();
  return db.getAllAsync(
    `SELECT d.destination_id AS id, d.destination_name AS name,
        (SELECT COUNT(*) FROM user_progress p WHERE p.destination_id = d.destination_id) AS attempts
     FROM destinations d ORDER BY attempts DESC, d.destination_name LIMIT ?`,
    [limit]
  );
}

export async function listTourists() {
  const db = await getDB();
  return db.getAllAsync(`
    SELECT u.user_id AS id, u.first_name || ' ' || u.last_name AS name, u.username, u.created_at,
      (SELECT COUNT(*) FROM (
         SELECT p.destination_id FROM user_progress p WHERE p.user_id = u.user_id
         GROUP BY p.destination_id
         HAVING MAX(CAST(p.quiz_score AS REAL) / p.quiz_total) >= ${PASSING_PERCENT / 100})) AS completed,
      (SELECT COUNT(*) FROM user_progress p WHERE p.user_id = u.user_id) AS attempts,
      (SELECT AVG(CAST(p.quiz_score AS REAL) / p.quiz_total) FROM user_progress p WHERE p.user_id = u.user_id) AS avg_ratio
    FROM users u WHERE u.role = 'Tourist' ORDER BY u.created_at DESC
  `);
}

export async function deleteUser(id) {
  const db = await getDB();
  await db.runAsync("DELETE FROM users WHERE user_id = ? AND role = 'Tourist'", [id]);
}

/* ------------------------------------------------------------------ */
/* Account settings                                                    */
/* ------------------------------------------------------------------ */
export async function updateProfile(userId, { first_name, last_name, username }) {
  const db = await getDB();
  const clash = await db.getFirstAsync(
    'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
    [username.trim(), userId]
  );
  if (clash) throw new Error('That username is taken. Please choose another one.');
  await db.runAsync('UPDATE users SET first_name = ?, last_name = ?, username = ? WHERE user_id = ?', [
    first_name.trim(), last_name.trim(), username.trim(), userId,
  ]);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const db = await getDB();
  const ok = await db.getFirstAsync('SELECT user_id FROM users WHERE user_id = ? AND password_hash = ?', [
    userId,
    await hashPassword(currentPassword),
  ]);
  if (!ok) throw new Error('Your current password is incorrect.');
  await db.runAsync('UPDATE users SET password_hash = ? WHERE user_id = ?', [await hashPassword(newPassword), userId]);
}

/** Tourists can delete their own account (their quiz progress goes with it). */
export async function deleteAccount(userId) {
  const db = await getDB();
  await db.runAsync("DELETE FROM users WHERE user_id = ? AND role = 'Tourist'", [userId]);
}

/* ------------------------------------------------------------------ */
/* App settings (custom logo)                                          */
/* ------------------------------------------------------------------ */
export async function getSetting(key) {
  const db = await getDB();
  const row = await db.getFirstAsync('SELECT value FROM app_settings WHERE key = ?', [key]);
  return row ? row.value : null;
}
export async function setSetting(key, value) {
  const db = await getDB();
  await db.runAsync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', [key, value]);
}
export async function deleteSetting(key) {
  const db = await getDB();
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', [key]);
}
