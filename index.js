const axios = require("axios");
// helper function for form encoding a request
const FormEncoder = obj => Object.keys(obj).reduce(
  (acc, curr) => acc === "" ?
    `${curr}=${encodeURIComponent(obj[curr])}`
    : `${acc}&${curr}=${obj[curr]}`,
  ""
);
module.exports = (client_id, client_secret, environment) => ({
  instance: "",
  token: "",
  client_id,
  client_secret,
  environment,
  /**
   * Performs a salesforce query
   * @param  {String} query Query to be executed against salesforce
   * @return {Promise<Request>} Resolves to an axios request object
   */
  salesforceQuery(query) {
    return axios.get(`${this.instance}/services/data/v45.0/query/`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      },
      params: {
        q: query
      }
    });
  },
  /**
   * Performs a salesforce query
   * @param  {String} type Type of object to be retrieved from salesforce
   * @param  {String} id Id of the object to be retrieved from salesforce
   * @return {Promise<Request>} Resolves to an axios request object
   */
  getSalesforceObject(type, id) {
    return axios.get(
      `${this.instance}/services/data/v45.0/sobjects/${type}/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      }
    );
  },
  /**
   * Performs an update on a salesforce object
   * @param  {String} type Type of object to be updated
   * @param  {String} id Id of the object to be updated
   * @param  {Object} updates Updates to be applied to the object
   * @return {Promise<Request>} Resolves to an axios request object
   */
  updateSalesforceObject(type, id, updates) {
    return axios.patch(
      `${this.instance}/services/data/v45.0/sobjects/${type}/${id}`,
      updates,
      {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
      }
    );
  },
  createSalesforceObject(type, object) {
    return axios.post(
      `${this.instance}/services/data/v45.0/sobjects/${type}`,
      object,
      {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
      }
    );
  },
  /**
   * Authorization function to set instance and token to be used in salesforce calls
   * @param  {String} username Username of the user to be logged in
   * @param  {String} password Password of the user to be logged in
   * @return {Promise} Resolves when the login is successful
   * @throws {Error} If the request fails for any reason
   */
  async authorize(username,password) {
    const getToken = async (url, body) => {
      const { data: { access_token, instance_url }} = await axios.post(
        url,
        body
      );
      return { access_token, instance_url };
    };
    const body = FormEncoder({
      client_id: this.client_id,
      client_secret: this.client_secret,
      grant_type: "password",
      username,
      password
    });
    if (this.environment !== "prod") {
      const { access_token, instance_url } = await getToken(
        "https://test.salesforce.com/services/oauth2/token",
        body
      );
      this.token = access_token;
      this.instance = instance_url;
      return;
    }
    const { access_token, instance_url } = await getToken(
      "https://login.salesforce.com/services/oauth2/token",
      body
    );
    this.token = access_token;
    this.instance = instance_url;
  },
  /**
   * Function to retrieve a user record from salesforce
   * @param  {String} username Username for the user to be retrieved
   * @return {Promise<Object>} Returns an Object containing all the properties and values for the salesforce user record
   */
  async getUser(username) {
    const { data: { records: [{ Id }] } } = await this.salesforceQuery(`SELECT Id FROM User WHERE Username = '${username}'`);
    return await this.getSalesforceObject("user", Id);
  },
  /**
   * Updates information on the user record
   * @param {String} username Username on the record to be updated
   * @param {Object} updates    Updates to be applied to the record
   */
  async setUser(username, updates) {
    const { data: {records: [{ Id }]} } = await this.salesforceQuery(`SELECT Id FROM User WHERE Username = '${username}'`);
    await this.updateSalesforceObject("user", Id, updates);
  },
  /**
   * Function to easily create user records in salesforce
   * @param  {Object} user     user record values to be created
   * @return {Promise}         Resolves when the contact is created
   */
  async createUser(user) {
    return await this.createSalesforceObject("user", user);
  },
  /**
   * Retrieves a contact record from salesforce
   * @param  {String} email Email found on the contact record
   * @return {Promise<Object>} Object containing the record for the contact in salesforce
   */
  async getContact(email) {
    const { data: { records: [{ Id }] } } = await this.salesforceQuery(`SELECT Id FROM Contact WHERE Email = '${email}'`);
    const { data } = await this.getSalesforceObject("contact", Id);
    return data;
  },
  /**
   * Retrieves an array of all contacts matching on an email.
   * @param  {String} email email on the contact records in saleforce to be retrieved
   * @return {Promise<Array>} Resolves with the contact record
   */
  async getContacts(email) {
    const idReducer = ({ Id }) => Id;
    const dataReducer = ({ data }) => data;
    const { data: { records } } = await this.salesforceQuery(`SELECT Id FROM Contact WHERE Email = '${email}'`);
    return await Promise.all(
      records
        .map(idReducer)
        .map(id => this.getSalesforceObject("contact", id).then(dataReducer))
    );
  },
  /**
   * Function to update the contact record
   * @param {String} email email on the contact record to be updated
   * @param {Object} updates updates to be made to the contact record
   */
  async setContact(email, updates) {
    const { data: { records: [{ Id }] } } = await this.salesforceQuery(`SELECT Id FROM Contact WHERE Email = '${email}'`);
    await this.updateSalesforceObject("contact", Id, updates);
  },
  /**
   * Function to easily create contact records in salesforce
   * @param  {Object} contact  contact record values to be created
   * @return {Promise}         Resolves when the contact is created
   */
  async createContact(contact) {
    return await this.createSalesforceObject("contact", contact);
  },
  /**
   * Function to deactivate a user in salesforce
   * @param  {String} username username of the user to be deactivated
   * @return {Promise} Promise resolves when the user deactivation completes
   */
  async deactivateUser(username) {
    await this.setUser(username, { isActive: false });
  },
  /**
   * Function to deactivate a portal user in salesforce (salesforce communities)
   * @param  {String} username username of the user to be deactivated
   * @return {Promise} Promise resolves when the user deactivation completes
   */
  async deactivatePortalUser(username) {
    await this.setUser(username, { isActive: false, isPortalEnabled: false });
  }
});
