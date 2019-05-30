const axios = require('axios');
// helper function for form encoding a request
const FormEncoder = obj => Object.keys(obj).reduce(
  (acc, curr) => acc === '' ?
    `${curr}=${encodeURIComponent(obj[curr])}`
    : `${acc}&${curr}=${obj[curr]}`,
    ''
  );
module.exports = {
  _instance: '',
  get instance() {
    return `https://${this._instance}.my.salesforce.com`;
  },
  set instance(value) {
    this._instance = value;
  },
  token: '',
  client_id: '',
  client_secret: '',
  environment: '',
  async authorize(username="",password="") {
    const getFromUrl = url => `${url.split('.')[0].substring(8)}.${url.split('.')[1]}`;
    const body = FormEncoder({
      client_id: this.client_id,
      client_secret: this.client_secret,
      grant_type: 'password',
      username,
      password
    });
    if (this.environment !== 'prod') {
      const { data: { access_token, instance_url }} = await axios.post(
        `https://test.salesforce.com/services/oauth2/token`,
        body
      );
      this.token = access_token;
      this.instance = getFromUrl(instance_url);
      return;
    }
    const { data: { access_token, instance_url }} = await axios.post(
      `https://login.salesforce.com/services/oauth2/token`,
      body
    );
    this.token = access_token;
    this.instance = getFromUrl(instance_url);
  },
  /**
   * [getUsers description]
   * @param  {String} username [description]
   * @return {[type]}          [description]
   */
  async getUser(username="") {
    const { data: {records: [{ Id }]} } = await axios.get(`${this.instance}/services/data/v42.0/query/`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      },
      params: {
        q: `SELECT Id FROM User WHERE Username = '${username}'`
      }
    });
    return await axios.get(
      `${this.instance}/services/data/v42.0/sobjects/user/${Id}`,
      {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      }
    );
  },
  /**
   * Updates information on the user record
   * @param {String} username [description]
   * @param {Object} props    [description]
   */
  async setUser(username="", props={}) {
    const { data: {records: [{ Id }]} } = await axios.get(`${this.instance}/services/data/v42.0/query/`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      },
      params: {
        q: `SELECT Id FROM User WHERE Username = '${username}'`
      }
    });
    await axios.patch(
      `${this.instance}/services/data/v42.0/sobjects/user/${Id}`,
      props,
      {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
      }
    );
  },
  /**
   * [getContact description]
   * @param  {String} email [description]
   * @return {[type]}       [description]
   */
  async getContact(email="") {
    const { data: {records: [{ Id }]} } = await axios.get(`${this.instance}/services/data/v42.0/query/`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      },
      params: {
        q: `SELECT Id FROM Contact WHERE Email = '${email}'`
      }
    });
    const { data } = await axios.get(
      `${this.instance}/services/data/v42.0/sobjects/contact/${Id}`,
      {
        headers: {
          "Authorization": `Bearer ${this.token}`
        }
      }
    );
    return data;
  },
  /**
   * [setContact description]
   * @param {Object} props [description]
   */
  async setContact(email="", props={}) {
    const { data: {records: [{ Id }]} } = await axios.get(`${this.instance}/services/data/v42.0/query/`, {
      headers: {
        "Authorization": `Bearer ${this.token}`
      },
      params: {
        q: `SELECT Id FROM Contact WHERE Email = '${email}'`
      }
    });
    const { data } = await axios.patch(
      `${this.instance}/services/data/v42.0/sobjects/contact/${Id}`,
      props,
      {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return data;
  },
  /**
   * [deactivateUser description]
   * @param  {String} username [description]
   * @return {[type]}          [description]
   */
  async deactivateUser(username="") {
    await this.setUser(username, { isActive: false });
  }
};
