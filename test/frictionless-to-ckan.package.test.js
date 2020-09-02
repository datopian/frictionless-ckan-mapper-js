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

test('Basic mappings', (t) => {
  const input = {
    description: 'Country, regional and world GDP in current USD.',
    homepage: 'https://datopian.com',
  }

  const exp = {
    notes: 'Country, regional and world GDP in current USD.',
    url: 'https://datopian.com',
  }

  t.deepEqual(packageFrictionlessToCkan(input), exp)
})

test('Dataset license', (t) => {
  let inputs = [
    // test name and path
    {
      licenses: [
        {
          name: 'odc-odbl',
          path: 'http://example.com/file.csv',
        },
      ],
    },
    // test name and title
    {
      licenses: [
        {
          title: 'Open Data Commons Open Database License',
          name: 'odc-odbl',
        },
      ],
    },
    // test if returns extras, since there are more than 1 licenses
    {
      licenses: [
        {
          title: 'Open Data Commons Open Database License',
          name: 'odc-pddl',
        },
        {
          title: 'Creative Commons CC Zero License (cc-zero)',
          name: 'cc-zero',
        },
      ],
    },
  ]

  let exps = [
    {
      license_id: 'odc-odbl',
      license_url: 'http://example.com/file.csv',
    },
    {
      license_id: 'odc-odbl',
      license_title: 'Open Data Commons Open Database License',
    },
    {
      license_id: 'odc-pddl',
      license_title: 'Open Data Commons Open Database License',
      extras: [
        {
          key: 'licenses',
          value: JSON.stringify([
            {
              title: 'Open Data Commons Open Database License',
              name: 'odc-pddl',
            },
            {
              title: 'Creative Commons CC Zero License (cc-zero)',
              name: 'cc-zero',
            },
          ]),
        },
      ],
    },
  ]

  inputs.map((input, i) => {
    t.deepEqual(packageFrictionlessToCkan(input), exps[i])
  })
})

test('Contributors', (t) => {
  let inputs = [
    // test title -> author
    {
      contributors: [
        {
          title: 'John Smith',
        },
      ],
    },
    // test maintainer
    {
      contributors: [
        {
          title: 'xyz',
          email: 'xyz@abc.com',
          organization: 'xxxxx',
          role: 'maintainer',
        },
      ],
    },
    // test if returns extras, since there are more than 2 contributors
    {
      contributors: [
        {
          title: 'abc',
          email: 'abc@abc.com',
        },
        {
          title: 'xyz',
          email: 'xyz@xyz.com',
          role: 'maintainer',
        },
      ],
    },
    {
      contributors: [
        { role: 'author', email: '', title: 'Patricio' },
        { role: 'maintainer', email: '', title: 'Rufus' },
        { role: 'author', email: '', title: 'Paul' },
      ],
    },
  ]

  let exps = [
    {
      author_email: undefined,
      author: 'John Smith',
    },
    {
      maintainer: 'xyz',
      maintainer_email: 'xyz@abc.com',
    },
    {
      author: 'abc',
      author_email: 'abc@abc.com',
      maintainer: 'xyz',
      maintainer_email: 'xyz@xyz.com',
    },
    {
      author: 'Patricio',
      author_email: '',
      maintainer: 'Rufus',
      maintainer_email: '',
      extras: [
        {
          key: 'contributors',
          value: JSON.stringify(inputs[3].contributors),
        },
      ],
    },
  ]

  inputs.map((input, i) => {
    t.deepEqual(packageFrictionlessToCkan(input), exps[i])
  })
})

test('Keywords converted to tags', (t) => {
  const input = {
    keywords: ['economy!!!', 'World Bank'],
  }

  const exp = {
    tags: [{ name: 'economy!!!' }, { name: 'World Bank' }],
  }

  t.deepEqual(packageFrictionlessToCkan(input), exp)
})

test('Extras is converted', (t) => {
  const input = {
    homepage: 'www.example.com',
    newdict: { key1: 'dict_to_jsonify' },
    newint: 123,
    newkey: 'new value',
    newlist: [1, 2, 3, 'string'],
    title: 'Title here',
  }

  const exp = {
    title: 'Title here',
    url: 'www.example.com',
    extras: [
      {
        key: 'newdict',
        value: JSON.stringify(input.newdict),
      },
      { key: 'newint', value: 123 },
      { key: 'newkey', value: 'new value' },
      { key: 'newlist', value: JSON.stringify(input.newlist) },
    ],
  }

  t.deepEqual(packageFrictionlessToCkan(input), exp)
})

test('Resources are converted', (t) => {
  const input = {
    name: 'gdp',
    resources: [
      {
        name: 'data.csv',
        path: 'http://someplace.com/data.csv',
        bytes: 100,
      },
    ],
  }

  const exp = {
    name: 'gdp',
    resources: [
      {
        name: 'data.csv',
        url: 'http://someplace.com/data.csv',
        size: 100,
      },
    ],
  }

  t.deepEqual(packageFrictionlessToCkan(input), exp)
})
