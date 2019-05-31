jest.mock("axios", () => ({
  get: jest.fn().mockImplementation(() => ({ data: 'foo' })),
  post: jest.fn().mockImplementation(() => ({ data: 'foo' })),
  patch: jest.fn()
}));
const axios = require('axios');
const SF = require('.')('stub-client-id', 'stub-client-secret', 'dev');

describe("Main tests", () => {
  beforeAll(() => {
    SF.token = 'stub-token';
  });
  afterEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.patch.mockReset();
  });
  test("Shape tests", () => {
    expect(SF.instance).toBeString();
    expect(SF.token).toBeString();
    expect(SF.client_id).toBeString();
    expect(SF.client_secret).toBeString();
    expect(SF.environment).toBeString();
    expect(SF.authorize).toBeFunction();
    expect(SF.getUser).toBeFunction();
    expect(SF.setUser).toBeFunction();
    expect(SF.getContact).toBeFunction();
    expect(SF.getContacts).toBeFunction();
    expect(SF.setContact).toBeFunction();
    expect(SF.deactivateUser).toBeFunction();
    expect(SF.deactivatePortalUser).toBeFunction();
    expect(SF.salesforceQuery).toBeFunction();
    expect(SF.getSalesforceObject).toBeFunction();
    expect(SF.updateSalesforceObject).toBeFunction();
  });
  describe("authorize", () => {
    test("rejects when data can't be extracted", () => {
      expect(() => SF.authorize()).toReject();
    })
    test("calls axios post when in dev", async () => {
      axios.post.mockImplementation(() => ({ data: {
        access_token: 'Play some pinball!',
        instance_url: 'https://foobar.cs12.my.salesforce.com'
      }}));
      await SF.authorize('fake', 'user');
      expect(axios.post).toBeCalled();
      expect(axios.post).toBeCalledWith(
        "https://test.salesforce.com/services/oauth2/token",
        "client_id=stub-client-id&client_secret=stub-client-secret&grant_type=password&username=fake&password=user"
      );
    });
    test("calls axios post when in prod", async () => {
      axios.post.mockImplementation(() => ({ data: {
        access_token: 'Play some pinball!',
        instance_url: 'https://foobar.cs12.my.salesforce.com'
      }}));
      SF.environment = 'prod';
      await SF.authorize('fake', 'user');
      expect(axios.post).toBeCalled();
      expect(axios.post).toBeCalledWith(
        "https://login.salesforce.com/services/oauth2/token",
        "client_id=stub-client-id&client_secret=stub-client-secret&grant_type=password&username=fake&password=user"
      );
    });
  });
  describe("getUser", () => {
    test("axios get should be called twice", async () => {
      axios.get.mockImplementation(() => ({
        data: {
          records: [
            { Id: 'fakeId' }
          ]
        }
      }));
      await SF.getUser("foobar@foo.bar");
      expect(axios.get.mock.calls.length).toBe(2);
      expect(axios.get).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/sobjects/user/fakeId",
        {"headers": {"Authorization": "Bearer Play some pinball!"}}
      );
      expect(axios.get).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/query/",
        {"headers": {"Authorization": "Bearer Play some pinball!"}, "params": {"q": "SELECT Id FROM User WHERE Username = 'foobar@foo.bar'"}}
      );
    });
  });
  describe("setUser", () => {
    test("Set user calls axios get and post", async () => {
      axios.get.mockImplementation(() => ({
        data: {
          records: [
            { Id: 'fakeId' }
          ]
        }
      }));
      await SF.setUser("foobar@foo.bar", { City: "Compton" });
      expect(axios.get).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/query/",
        {"headers": {"Authorization": "Bearer Play some pinball!"}, "params": {"q": "SELECT Id FROM User WHERE Username = 'foobar@foo.bar'"}}
      );
      expect(axios.patch).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/sobjects/user/fakeId",
        {"City": "Compton"},
        {"headers": {"Authorization": "Bearer Play some pinball!", "Content-Type": "application/json"}}
      );
    });
  });
  describe("getContact", () => {
    test("makes two get calls", async () => {
      axios.get.mockImplementation(() => ({
        data: {
          records: [
            { Id: 'fakeId' }
          ]
        }
      }));
      await SF.getContact("foobar@foo.bar");
      expect(axios.get.mock.calls.length).toBe(2);
      expect(axios.get).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/sobjects/contact/fakeId",
        {"headers": {"Authorization": "Bearer Play some pinball!"}}
      );
      expect(axios.get).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/query/",
        {"headers": {"Authorization": "Bearer Play some pinball!"}, "params": {"q": "SELECT Id FROM Contact WHERE Email = 'foobar@foo.bar'"}}
      );
    });
  });
  describe("getContacts", () => {
    test("Rejects when a request fails to return as expected", () => {
      expect(SF.getContacts()).toReject();
    });
  });
  describe("setContact", () => {
    test("makes a get call and a patch", async () => {
      axios.get.mockImplementation(() => ({
        data: {
          records: [
            { Id: 'fakeId' }
          ]
        }
      }));
      axios.patch.mockImplementation(() => ({
        data: 'fake-data'
      }));
      await SF.setContact("foobar@foo.bar", { Email: "foobar@fizz.buz" });
      expect(axios.get.mock.calls.length).toBe(1);
      expect(axios.get).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/query/",
        {"headers": {"Authorization": "Bearer Play some pinball!"}, "params": {"q": "SELECT Id FROM Contact WHERE Email = 'foobar@foo.bar'"}}
      );
      expect(axios.patch.mock.calls.length).toBe(1);
      expect(axios.patch).toBeCalledWith(
        "https://foobar.cs12.my.salesforce.com/services/data/v45.0/sobjects/contact/fakeId",
        {"Email": "foobar@fizz.buz"},
        {"headers": {"Authorization": "Bearer Play some pinball!", "Content-Type": "application/json"}}
      );
    });
  });
  describe("deactivateUser", () => {
    test("makes a call into setUser", async () => {
      SF.setUser = jest.fn();
      await SF.deactivateUser("foobar@foo.bar");
      expect(SF.setUser).toBeCalledWith("foobar@foo.bar", {"isActive": false});
    });
  });
  describe("deactivatePortalUser", () => {
    test("makes a call into setUser", async () => {
      SF.setUser = jest.fn();
      await SF.deactivatePortalUser("foobar@foo.bar");
      expect(SF.setUser).toBeCalledWith("foobar@foo.bar", {"isActive": false, "isPortalEnabled": false });
    });
  });
});
