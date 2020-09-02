/**
 *
 * Testing package conversion from frictionless to CKAN
 * The tests have been reused from original library
 * https://github.com/frictionlessdata/frictionless-ckan-mapper
 *
 */

const test = require('ava')
const fs = require('fs')

const {
  packageCkanToFrictionless,
  packageFrictionlessToCkan,
} = require('../lib')

test('Roundtrip', async (t) => {
  const ckan1 = JSON.parse(
    await fs.readFileSync(__dirname + '/fixtures/full-ckan-package.json')
  )

  const fd1 = packageCkanToFrictionless(ckan1)
  const ckan2 = packageFrictionlessToCkan(fd1)
  const fd2 = packageFrictionlessToCkan(ckan2)
  const ckan3 = packageFrictionlessToCkan(fd2)

  // const expect = JSON.parse(
  //   await fs.readFileSync(__dirname + '/fixtures/frictionless-resource.json')
  // )

  t.deepEqual(ckan2, ckan3)
})
