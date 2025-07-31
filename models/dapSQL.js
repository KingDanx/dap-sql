export default class dapSQL {
  static credentials = new Map([
    ["server", ""],
    ["port", ""],
    ["name", ""],
    ["user", ""],
    ["password", ""],
  ]);
  /**
   *
   * @param {string} driver
   * @param {Map<string,string>} credentials
   */
  constructor(credentials = dapSQL.credentials, driver = process.env.DB_DRIVER) {
    this.credentials = credentials;
    this.driver = driver;
  }

  connect() {}

  disconnect() {}

  query() {}

  /**
   *
   * @param {string} driver
   */
  setDriver(driver) {
    this.driver = driver;
  }

  /**
   *
   * @param {Map(<string,string>)} credentials
   */
  setCredentials(credentials) {
    this.credentials = credentials;
  }

  /**
   * @param {*} rows
   * @returns {Boolean} - are rows an array and are rows not empty
   */
  verifyOutput(recordset) {
    return recordset && Array.isArray(recordset) && recordset.length > 0;
  }
}
