import test from 'tape-promise/tape';
import { CompanyNameParser } from './profile-filter';

test('ensure company name parser works as expected', async (t) => {
  const cnp = new CompanyNameParser();

  const ibmAlts = cnp.getAltNamesFor('IBM Ireland Ltd');
  t.assert(ibmAlts.find(alt => alt.match('ibm')));

  const accentureAlts = cnp.getAltNamesFor('Accenture Research Europe');
  t.assert(accentureAlts.find(alt => alt.match('accenture')));

  const atosAlts = cnp.getAltNamesFor('Atos Europe');
  t.assert(atosAlts.find(alt => alt.match('atos')));

  const hpAlts = cnp.getAltNamesFor('Hewlett Packard - Silicon Valley');
  t.assert(hpAlts.find(alt => alt.match('hp')));

  const gmbhAlts = cnp.getAltNamesFor('My Company GMBH');
  t.assert(gmbhAlts.find(alt => alt.match('my company')));

  const sarlAlts = cnp.getAltNamesFor('My Company SARL');
  t.assert(sarlAlts.find(alt => alt.match('my company')));

  const ltdAlts = cnp.getAltNamesFor('My Company Ltd');
  t.assert(ltdAlts.find(alt => alt.match('my company')));
});
