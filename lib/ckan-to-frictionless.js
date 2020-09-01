const resourceMapping = {
  size: 'bytes',
  mimetype: 'mediatype',
  url: 'path',
}

const resourceKeysToRemove = ['position', 'datastore_active', 'state']

/**
 * Checks if there is a mapping returns the new key
 * otherwise return the same input
 * @param {string} key
 */
const getMapping = (key) => {
  const newKey = resourceMapping[key]
  if (newKey) return newKey
  return key
}

const packageCkanToFrictionless = (ckan) => {}
const resourceCkanToFrictionless = (ckanResource) => {
  /** Convert a CKAN ckanResource to Frictionless ckanResource.
   * */

  const frictionless = {}

  Object.entries(ckanResource).map(([key, value]) => {
    // check if the key is removable, if yes skip it
    if (resourceKeysToRemove.indexOf(key) > -1) return

    // if the value is null then skip it too
    if (value === null) return

    if (typeof value === 'string') {
      value = value.trimLeft().trimRight()
      /**
       * check if it's stringified array or object
       * if yes parse to JSON
       */
      if (value[0] === '{' || value[0] === '[') {
        try {
          value = JSON.parse(value)
        } catch (error) {
          //   do nothing
        }
      }
    }

    // get the mapping is applicable
    const newKey = getMapping(key)
    frictionless[newKey] = value
  })

  return frictionless
}

module.exports = {
  packageCkanToFrictionless,
  resourceCkanToFrictionless,
}
