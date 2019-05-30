# Salesforce-Users

This module contains methods used when interacting with salesforce users. There are a number of methods that can be used to retrieve details about a user and a utility method for setting properties of those users.

### Usage

`npm i @chg/salesforce-users`

```javascript
const sfUsers = require('@chg/salesforce-users');

sfUsers.environment = 'dev' // makes the call into test.salesforce.com
sfUsers.client_id = '<your client id>' // client id of the app in salesforce also called 'consumer key'
sfUsers.client_secret = '<your client secret>' // client secret for the app in salesforce

// make sure the user you use has access to change user and contact records in salesforce
sf.authorize('admin_user', 'shhh secret password!'); 

const user = await sf.getUser('MrTumnus@yahoo.com');
await sf.setUser('MrTumnus@yahoo.com', { FavoriteFood: "Turkish Delight" });

const contact = await sf.getContact('MrTumnus@yahoo.com');
await sf.setContact('MrTumnus@yahoo.com', { FavoriteFood: "Turkish Delight" });

// We are ready to delete Mr. Tumnus
await sf.deactivateUser("MrTumnus@yahoo.com");
```

