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
   * 
   * @returns {Promise<PG.Pool|Error>} This only returns a promise to keep the overall syntax normalized
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const db = new PG.Pool({
          user: this.credentials.get("user"),
          password: this.credentials.get("password"),
          host: this.credentials.get("server"),
          port: parseInt(this.credentials.get("port")),
          database: this.credentials.get("name"),
        });
        this.db = db;
        resolve(this.db);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  async disconnect() {
    if (this.db) {
      void (await this.db.end());
    }
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
