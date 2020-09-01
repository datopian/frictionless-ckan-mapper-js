const {
  packageCkanToFrictionless,
  resourceCkanToFrictionless,
} = require('./ckan-to-frictionless')

const {
  getPackageCriteria,
  getResourceCriteria,
} = require('./friction-to-ckan-criteria')

const applyCriteria = (target, criteria, key, value) => {
  const { mapping, process, extract } = criteria

  // if there is a mapping then assign the value
  // to the appropriate field name with processed value (if applicable);
  if (mapping) target[mapping] = process(value)

  const result = extract(value, key)
  // if there is extract then assign that new key values to ckan object
  if (result) {
    const { extras, ...rest } = result
    Object.assign(target, rest)
    if (extras) {
      target.extras = target.extras || []
      target.extras = target.extras.concat(extras)
    }
  }
}

const resourceFrictionlessToCkan = (frictionlessResource) => {
  const newResource = {}
  Object.entries(frictionlessResource).map(([key, value]) => {
    const criteria = getResourceCriteria(key)
    applyCriteria(newResource, criteria, key, value)
  })

  return newResource
}

/**
 * The algorithm is based on some defined criterias, meaning that
 * each property has it's own criteria based on which
 * it will be processed, mapped or kept. So whether to pass through, map to a
 * new property, keep it in extras is being defined by the criteria.
 * @param {Object} frictionlessPackage
 */
const packageFrictionlessToCkan = (frictionlessPackage) => {
  const ckanPackage = {}

  Object.entries(frictionlessPackage).map(([key, value]) => {
    // if it is resources data then apply the resource criteria
    if (key === 'resources') {
      /**
       * Iterate over each element of resource object
       * and apply the relevant criteria
       */
      const resources = value.map((resource) => {
        return resourceFrictionlessToCkan(resource)
      })
      /**
       * Assign new converted resources array to `ckanPackage`
       */
      ckanPackage.resources = resources
      return
    }

    // apply package criteria
    const criteria = getPackageCriteria(key)
    applyCriteria(ckanPackage, criteria, key, value)
  })

  return ckanPackage
}

module.exports = {
  packageFrictionlessToCkan,
  resourceFrictionlessToCkan,
  packageCkanToFrictionless,
  resourceCkanToFrictionless,
}
