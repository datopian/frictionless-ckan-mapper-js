const {
  packageCkanToFrictionless,
  resourceCkanToFrictionless,
} = require('./ckan-to-frictionless')

const {
  packageFrictionlessToCkan,
  resourceFrictionlessToCkan,
} = require('./frictionless-to-ckan')

module.exports = {
  packageFrictionlessToCkan,
  resourceFrictionlessToCkan,
  packageCkanToFrictionless,
  resourceCkanToFrictionless,
}
