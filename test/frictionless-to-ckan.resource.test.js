/**
 *
 * Testing resource conversion from frictionless to CKAN
 * Some part of the tests have been reused from original library
 * https://github.com/frictionlessdata/frictionless-ckan-mapper
 *
 */

const test = require('ava')
const { resourceFrictionlessToCkan } = require('../lib')

test('Non ckan keys passthrough', (t) => {
  const input = {
    title_cn: '國內生產總值',
    years: [2015, 2016],
    last_year: 2016,
    location: { country: 'China' },
  }

  const exp = {
    title_cn: '國內生產總值',
    years: [2015, 2016],
    last_year: 2016,
    location: { country: 'China' },
  }

  t.deepEqual(resourceFrictionlessToCkan(input), exp)
})

test('Path to url', (t) => {
  // Test remote path
  let input = { path: 'http://www.somewhere.com/data.csv' }
  let output = resourceFrictionlessToCkan(input)
  t.is(output['url'], input['path'])

  // Test local path
  input = { path: './data.csv' }
  output = resourceFrictionlessToCkan(input)
  t.is(output['url'], input['path'])

  // Test POSIX path
  input = { path: '/home/user/data.csv' }
  output = resourceFrictionlessToCkan(input)
  t.is(output['url'], input['path'])
})

test('Bytes -> size && mediatype -> mimetype', (t) => {
  let input = {
    bytes: 10,
    mediatype: 'text/csv',
  }
  const exp = {
    size: 10,
    mimetype: 'text/csv',
  }
  t.deepEqual(resourceFrictionlessToCkan(input), exp)
})

test('Passthrough', (t) => {
  let input = {
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
  t.deepEqual(resourceFrictionlessToCkan(input), input)
})
