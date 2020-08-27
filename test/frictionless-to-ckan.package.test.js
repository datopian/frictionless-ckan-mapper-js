/**
 *
 * Testing package conversion from frictionless to CKAN
 * Some part of the tests have been reused from original library
 * https://github.com/frictionlessdata/frictionless-ckan-mapper
 *
 */

const test = require('ava')
const { packageFrictionlessToCkan } = require('../lib')

test('Non frictionless keys pass through', (t) => {
  const input = {
    name: 'gdp',
    id: 'xxxx',
    title: 'Countries GDP',
    version: '1.0',
    owner_org: 'a275814e-6c15-40a8-99fd-af911f1568ef',
    metadata_created: '2020-03-31T21:57:48.676558',
    metadata_modified: '2020-03-31T21:57:50.215642',
    creator_user_id: 'b5ab876c-0d04-479a-92de-f66db5dd6fb3',
    private: false,
    revision_id: 'xxx',
  }

  const exp = {
    name: 'gdp',
    id: 'xxxx',
    title: 'Countries GDP',
    version: '1.0',
    owner_org: 'a275814e-6c15-40a8-99fd-af911f1568ef',
    metadata_created: '2020-03-31T21:57:48.676558',
    metadata_modified: '2020-03-31T21:57:50.215642',
    creator_user_id: 'b5ab876c-0d04-479a-92de-f66db5dd6fb3',
    private: false,
    revision_id: 'xxx',
  }

  t.deepEqual(packageFrictionlessToCkan(input), exp)
})
