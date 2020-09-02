/**
 *
 * Testing package conversion from frictionless to CKAN
 * The tests have been reused from original library
 * https://github.com/frictionlessdata/frictionless-ckan-mapper
 *
 */

const test = require('ava')

const { packageCkanToFrictionless } = require('../lib')

test('dataset extras', async (t) => {
  const input = {
    extras: [
      { key: 'title_cn', value: '國內生產總值' },
      { key: 'years', value: '[2015, 2016]' },
      { key: 'last_year', value: 2016 },
      { key: 'location', value: '{"country": "China"}' },
    ],
  }

  const expect = {
    title_cn: '國內生產總值',
    years: [2015, 2016],
    last_year: 2016,
    location: { country: 'China' },
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('unjsonify all extra values', async (t) => {
  const input = {
    extras: [
      {
        key: 'location',
        value:
          '{"country": {"China": {"population": "1233214331", "capital": "Beijing"}}}',
      },
      {
        key: 'numbers',
        value: '[[[1, 2, 3], [2, 4, 5]], [[7, 6, 0]]]',
      },
    ],
  }

  const expect = {
    location: {
      country: { China: { population: '1233214331', capital: 'Beijing' } },
    },
    numbers: [
      [
        [1, 2, 3],
        [2, 4, 5],
      ],
      [[7, 6, 0]],
    ],
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('dataset license', async (t) => {
  // No license_title nor license_url
  let input = {
    license_id: 'odc-odbl',
  }

  let expect = {
    licenses: [
      {
        name: 'odc-odbl',
      },
    ],
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)

  // Remap everything in licenses
  input = {
    license_id: 'cc-by',
    license_title: 'Creative Commons Attribution',
    license_url: 'http://www.opendefinition.org/licenses/cc-by',
  }

  expect = {
    licenses: [
      {
        name: 'cc-by',
        title: 'Creative Commons Attribution',
        path: 'http://www.opendefinition.org/licenses/cc-by',
      },
    ],
  }
  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('dataset license with licenses in extras', async (t) => {
  const input = {
    license_id: 'odc-odbl',
    license_title: 'Open Data Commons Open Database License',
    license_url: 'https://opendatacommons.org/licenses/odbl/1-0/index.html',
    extras: [
      {
        key: 'licenses',
        value: JSON.stringify([
          {
            name: 'cc-by',
            title: 'Creative Commons Attribution',
            path: 'http://www.opendefinition.org/licenses/cc-by',
          },
          {
            name: 'odc-by',
            title: 'Open Data Commons Attribution License',
            path: 'https://opendatacommons.org/licenses/by/1-0/index.html',
          },
        ]),
      },
    ],
  }

  const expect = {
    licenses: [
      {
        name: 'odc-odbl',
        title: 'Open Data Commons Open Database License',
        path: 'https://opendatacommons.org/licenses/odbl/1-0/index.html',
      },
      {
        name: 'odc-by',
        title: 'Open Data Commons Attribution License',
        path: 'https://opendatacommons.org/licenses/by/1-0/index.html',
      },
    ],
  }
  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('keys are passed through', async (t) => {
  const input = {
    name: 'gdp',
    id: 'xxxx',
    title: 'Countries GDP',
    version: '1.0',
    // random
    xxx: 'aldka',
  }

  const expect = {
    name: 'gdp',
    id: 'xxxx',
    title: 'Countries GDP',
    version: '1.0',
    xxx: 'aldka',
  }
  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('key mappings', async (t) => {
  const input = {
    notes: 'Country, regional and world GDP',
    url: 'https://datopian.com',
  }

  const expect = {
    description: 'Country, regional and world GDP',
    homepage: 'https://datopian.com',
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('dataset author and maintainer', async (t) => {
  let input = {
    author: 'World Bank and OECD',
    author_email: 'someone@worldbank.org',
  }

  let expect = {
    contributors: [
      {
        title: 'World Bank and OECD',
        email: 'someone@worldbank.org',
        role: 'author',
      },
    ],
  }
  t.deepEqual(packageCkanToFrictionless(input), expect)

  input = {
    author: 'World Bank and OECD',
    author_email: 'someone@worldbank.org',
    maintainer: 'Datopian',
    maintainer_email: 'helloxxx@datopian.com',
  }

  expect = {
    contributors: [
      {
        title: 'World Bank and OECD',
        email: 'someone@worldbank.org',
        role: 'author',
      },
      {
        title: 'Datopian',
        email: 'helloxxx@datopian.com',
        role: 'maintainer',
      },
    ],
  }
  t.deepEqual(packageCkanToFrictionless(input), expect)

  // if we already have contributors use that ...
  input = {
    contributors: [
      {
        title: 'Datopians',
      },
    ],
    author: 'World Bank and OECD',
  }

  expect = {
    contributors: [
      {
        title: 'Datopians',
      },
    ],
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('dataset tags', async (t) => {
  const input = {
    tags: [
      {
        display_name: 'economy',
        id: '9d602a79-7742-44a7-9029-50b9eca38c90',
        name: 'economy',
        state: 'active',
      },
      {
        display_name: 'worldbank',
        id: '3ccc2e3b-f875-49ef-a39d-6601d6c0ef76',
        name: 'worldbank',
        state: 'active',
      },
    ],
  }

  const expect = {
    keywords: ['economy', 'worldbank'],
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('resources are converted', async (t) => {
  const input = {
    name: 'gdp',
    resources: [
      {
        name: 'data.csv',
        url: 'http://someplace.com/data.csv',
        size: 100,
      },
    ],
  }

  const expect = {
    name: 'gdp',
    resources: [
      {
        name: 'data.csv',
        path: 'http://someplace.com/data.csv',
        bytes: 100,
      },
    ],
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('all keys are passed through', async (t) => {
  const input = {
    description: 'GDPs list',
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

  t.deepEqual(packageCkanToFrictionless(input), input)
})

test('package keys are removed that should be', async (t) => {
  const input = {
    isopen: true,
    num_tags: 1,
    num_resources: 10,
    state: 'active',
    organization: {
      description: '',
      title: 'primary_care_prescribing_dispensing',
      created: '2020-03-31T21:51:41.334189',
      approval_status: 'approved',
      is_organization: true,
      state: 'active',
      image_url: '',
      revision_id: '7c86fde3-9899-41d6-b0bb-6c72dd4b6b94',
      type: 'organization',
      id: 'a275814e-6c15-40a8-99fd-af911f1568ef',
      name: 'primary_care_prescribing_dispensing',
    },
  }

  const expect = {}

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('null values are stripped', async (t) => {
  const input = {
    id: '12312',
    title: 'title here',
    format: null,
  }

  const expect = {
    id: '12312',
    title: 'title here',
  }

  t.deepEqual(packageCkanToFrictionless(input), expect)
})

test('empty tags ignored', async (t) => {
  const input = {
    tags: [],
  }
  const expect = {}

  t.deepEqual(packageCkanToFrictionless(input), expect)
})
