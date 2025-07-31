import dapSQL from "./dapSQL.js";
import sql from "mssql/msnodesqlv8.js";

export default class MSSQL extends dapSQL {
    /**
     * 
     * @param {Map<string,string>} credentials 
     * @param {string} driver 
     */
  constructor(credentials, driver) {
    super(credentials, driver);
    this.db;
  }

  /**
   * Establishes a connection to the database using provided credentials.
   *
   * @param {Map<string, string>} credentials - A map containing database connection details.
   * @returns {sql.ConnectionPool | Error} Returns a Pool instance if successful, otherwise an Error.
   */
  async connect() {
    try {
      const server = this.credentials.get("server");
      const dbName = this.credentials.get("name");
      const dbUser = this.credentials.get("user");
      const dbPassword = this.credentials.get("password");

      let connectionString = `Driver={${this.driver}};Server=${server};Database=${dbName};`;

      if (dbUser && dbPassword) {
        connectionString += `Uid=${dbUser};Pwd=${dbPassword};`;
      } else {
        connectionString += "Trusted_Connection=yes;";
      }

      connectionString += "TrustServerCertificate=yes;";

      const conn = new sql.ConnectionPool({
        connectionString,
      });
      this.db = await conn.connect();
      return this.db;
    } catch (e) {
      console.info("Connection failed:", e.message);
      return e;
    }
  }

  async disconnect() {
    try {
      void (await this.db.close());
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Executes a database query with parameters
   * @param {string} query - SQL query string
   * @param {Array<string|number>} args - Query parameters
   * @returns {Promise<Array<Object>|Error>} Query results or Error if failed
   * @async
   */
  async query(query, args) {
    try {
      const request = this.db.request();

      for (let i = 0; i < args.length; i++) {
        const paramName = `$${i + 1}`;
        if (query.includes(paramName)) {
          query = query.replaceAll(paramName, `@${paramName}`);
          request.input(paramName, args[i]);
        }
      }

      const result = await request.query(query);

      if (!result.rows) {
        result.rows = result.recordset;
      }

      return result;
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  /**
   *
   * @param {String} sql
   * @returns
   */
  withNoLocks(sql) {
    const regex =
      /(FROM|JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|INNER\s+JOIN|FULL\s+JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\s+(?:AS\s+)?[a-zA-Z_][a-zA-Z0-9_]*)?)/gi;
    return sql.replace(regex, (match, joinType, tableNameAndAlias) => {
      //? Check if WITH (NOLOCK) already exists after this table
      const afterMatch = sql.substring(sql.indexOf(match) + match.length);
      if (afterMatch.trim().startsWith("WITH (NOLOCK)")) {
        return match;
      }

      if (tableNameAndAlias.toUpperCase().includes("WHERE")) {
        return match.replace("WHERE", "WITH (NOLOCK) WHERE");
      }

      return `${joinType} ${tableNameAndAlias.trim()} WITH (NOLOCK)`;
    });
  }
}
