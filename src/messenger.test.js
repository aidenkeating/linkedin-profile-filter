import test from 'tape-promise/tape';
import ChromeMessenger from './messenger';

test('ensure search provides the correct message structure', async (t) => {
  t.plan(4);
  const expectedName = 'name';
  const expectedCompany = 'company';
  const expectedLocation = 'location';
  const mockProducer = {
    sendMessage: async (msg) => {
      t.equal(msg.action, 'search');
      t.equal(msg.body.name, expectedName);
      t.equal(msg.body.company, expectedCompany);
      t.equal(msg.body.location, expectedLocation);
      return Promise.resolve([]);
    }
  };
  const testMessenger = new ChromeMessenger(mockProducer);
  await testMessenger.search({
    name: expectedName,
    company: expectedCompany,
    location: expectedLocation
  });
});

test('ensure clear cache provides the correct message structure', async (t) => {
  t.plan(1);
  const mockProducer = {
    sendMessage: async (msg) => {
      t.equal(msg.action, 'clear-cache');
      return Promise.resolve([]);
    }
  };
  const testMessenger = new ChromeMessenger(mockProducer);
  await testMessenger.clearCache();
});
