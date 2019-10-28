# Salesforce-Users
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fchgdev%2Fsalesforce-users.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fchgdev%2Fsalesforce-users?ref=badge_shield)


This module contains methods used when interacting with salesforce users. There are a number of methods that can be used to retrieve details about a user and a utility method for setting properties of those users.

### Usage

`npm i @chg/salesforce-users`

```javascript
const sfUsers = require('@chg/salesforce-users')('client_id', 'client_secret', 'dev');

// make sure the user you use has access to change user and contact records in salesforce
sf.authorize('admin_user', 'shhh secret password!'); 

// Get/Set user
const user = await sf.getUser('MrTumnus@yahoo.com');
await sf.setUser('MrTumnus@yahoo.com', { FavoriteFood: "Turkish Delight" });

// Get/Set contact
const contact = await sf.getContact('MrTumnus@yahoo.com');
await sf.setContact('MrTumnus@yahoo.com', { FavoriteFood: "Turkish Delight" });

// We are ready to delete Mr. Tumnus
await sf.deactivateUser("MrTumnus@yahoo.com");
```



## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fchgdev%2Fsalesforce-users.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fchgdev%2Fsalesforce-users?ref=badge_large)