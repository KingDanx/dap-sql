import dapSQL from "./dapSQL.js";
import PG from "pg";

/**
 * @class - Provides connect, disconnect, and query methods for PostgreSQL databases using pgsql
 * @constructor
 * @param {Map<string,string>} credentials
 * @param {string} driver
 * @property {PG.Pool|null} db
 */
export default class PGSQL extends dapSQL {
  constructor(credentials) {
    super(credentials);
  }

  db = null;

  /**
   * @returns {Promise<PG.Pool|Error>}
   */
  async connect() {
    try {
      const timeout = setTimeout(() => {
        throw new Error("failed to connect to the database");
      }, 3_000);
      const db = new PG.Pool({
        user: this.credentials.get("user"),
        password: this.credentials.get("password"),
        host: this.credentials.get("server"),
        port: parseInt(this.credentials.get("port")),
        database: this.credentials.get("name"),
      });
      await db.connect();
      clearTimeout(timeout);
      this.db = db;
      return this.db;
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  async disconnect() {
    if (this.db) {
      return void (await this.db.end());
    }
    return;
  }

  /**
   *
   * @param {string} query
   * @param {Array<string|number|boolean>} args
   * @returns {Promise<PG.QueryResult|Error>}
   */
  async query(query, args) {
    try {
      const result = await this.db.query(query, args);

      if (!result.recordset) {
        result.recordset = result.rows;
      }

      return result;
    } catch (e) {
      console.error(e);
      return e;
    }
  }
}
