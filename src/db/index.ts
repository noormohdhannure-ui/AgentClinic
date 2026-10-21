import Database from "better-sqlite3";
import { migrations } from "./migrations.js";

export type Db = Database.Database;

// Opens the database, turns on foreign keys, and runs any migrations the
// file hasn't had yet. Use ":memory:" for a fresh database in tests.
export function openDb(path: string): Db {
  const db = new Database(path);
  db.pragma("foreign_keys = ON");

  const applied = db.pragma("user_version", { simple: true }) as number;
  migrations.slice(applied).forEach((sql, index) => {
    db.transaction(() => {
      db.exec(sql);
      db.pragma(`user_version = ${applied + index + 1}`);
    })();
  });

  return db;
}
