/**
 *
 * Testing package conversion from frictionless to CKAN
 * The tests have been reused from original library
 * https://github.com/frictionlessdata/frictionless-ckan-mapper
 *
 */

const test = require('ava')
const fs = require('fs')

const { resourceCkanToFrictionless } = require('../lib')

test('Converts fixture', async (t) => {
  const input = JSON.parse(
    await fs.readFileSync(__dirname + '/fixtures/ckan-resource.json')
  )
  const expect = JSON.parse(
    await fs.readFileSync(__dirname + '/fixtures/frictionless-resource.json')
  )

  t.deepEqual(resourceCkanToFrictionless(input), expect)
})

test('values are unjsonified', async (t) => {
  // Test values which are jsonified dict or arrays are unjsonified
  const schema = {
    fields: [{ name: 'abc', type: 'string' }],
  }
  let input = {
    schema: JSON.stringify(schema),
    otherval: JSON.stringify(schema),
    x: "{'abc': 1",
  }

  let expect = {
    schema: schema,
    otherval: schema,
    // fake json object - not really ... but looks like it ...
    x: "{'abc': 1",
  }

  t.deepEqual(resourceCkanToFrictionless(input), expect)

  input = {
    x: 'hello world',
    y: '1.3',
  }

  expect = {
    x: 'hello world',
    y: '1.3',
  }

  t.deepEqual(resourceCkanToFrictionless(input), expect)
})

test('resource keys are removed that should be', async (t) => {
  const input = {
    position: 2,
    datastore_active: true,
    state: 'active',
  }

  const expect = {}

  t.deepEqual(resourceCkanToFrictionless(input), expect)
})

test('resource mapping', async (t) => {
  const input = {
    url: 'http://www.somewhere.com/data.csv',
    size: 110,
    mimetype: 'text/csv',
  }

  const expect = {
    path: 'http://www.somewhere.com/data.csv',
    bytes: 110,
    mediatype: 'text/csv',
  }

  t.deepEqual(resourceCkanToFrictionless(input), expect)
})

test('test resource path is set even for uploaded resources', async (t) => {
  const input = {
    url: 'http://www.somewhere.com/data.csv',
    url_type: 'upload',
  }

  const expect = {
    path: 'http://www.somewhere.com/data.csv',
    url_type: 'upload',
  }

  t.deepEqual(resourceCkanToFrictionless(input), expect)
})

test('resource keys pass through', async (t) => {
  const input = {
    id: 'xxx',
    name: 'abc',
    description: 'GDPs list',
    format: 'CSV',
    hash: 'e785c0883d7a104330e69aee73d4f235',
    schema: {
      fields: [
        { name: 'id', type: 'integer' },
        { name: 'title', type: 'string' },
      ],
    },
    // random
    adfajka: 'aaaa',
    '1dafak': 'abbbb',
  }

  t.deepEqual(resourceCkanToFrictionless(input), input)
})

test('nulls are stripped', async (t) => {
  const input = {
    abc: 'xxx',
    size: null,
    xyz: null,
  }

  const expect = {
    abc: 'xxx',
  }

  t.deepEqual(resourceCkanToFrictionless(input), expect)
})
