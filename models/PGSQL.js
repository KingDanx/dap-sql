import SQL from "./SQL";
import PG from "pg";

export default class PGSQL extends SQL {
  /**
   *
   * @param {Map<string,string} credentials
   */
  constructor(credentials) {
    super(credentials);
    /**
     * @type {PG.Pool|null}
     */
    this.db;
  }

  async connect() {
    try {
      const db = new PG.Pool({
        user: this.credentials.get("user"),
        password: this.credentials.get("password"),
        host: this.credentials.get("server"),
        port: parseInt(this.credentials.get("port")),
        database: this.credentials.get("name"),
      });
      this.db = db;
      return this.db;
    } catch (e) {
      console.error(e);
      return e;
    }
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
