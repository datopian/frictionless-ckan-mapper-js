const {
  passthroughCriteria,
  criteriaList,
} = require('./friction-to-ckan-criteria.package')

const packageFrictionlessToCkan = (frictionlessPackage) => {
  const ckanPackage = {}

  Object.entries(frictionlessPackage).map(([key, value]) => {
    const criteria = criteriaList[key] || passthroughCriteria(key)
    const { mapping, process, extract } = criteria

    // if there is a mapping then assign the value
    // to the appropriate field name with processed value (if applicable);
    if (mapping) ckanPackage[mapping] = process(value)

    const extras = extract(value)
    // if there is extract then assign that new key values to ckan object
    if (extras) Object.assign(ckanPackage, ...extras)
  })

  return ckanPackage
}

const resourceFrictionlessToCkan = () => {}

module.exports = {
  packageFrictionlessToCkan,
  resourceFrictionlessToCkan,
}
