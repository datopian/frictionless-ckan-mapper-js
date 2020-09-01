const resourceMapping = {
  size: 'bytes',
  mimetype: 'mediatype',
  url: 'path',
}

const resourceKeysToRemove = ['position', 'datastore_active', 'state']

const packageKeysToRemove = [
  'state', // b/c this is state info not metadata about dataset
  'isopen', // computed info from license (render info not metadata)
  'num_resources', // render info not metadata
  'num_tags', // ditto
  'organization', // already have owner_org id + this inlines related object
  'author',
  'author_email',
  'maintainer',
  'maintainer_email',
  'license_id',
  'license_title',
  'license_url',
  'tags',
]

const packageMapping = {
  notes: 'description',
  url: 'homepage',
}

/**
 * Checks if there is a mapping for resource returns the new key
 * otherwise return the same input
 * @param {string} key
 */
const getResourceMapping = (key) => {
  const newKey = resourceMapping[key]
  if (newKey) return newKey
  return key
}

/**
 * Checks if there is a mapping for package returns the new key
 * otherwise return the same input
 * @param {string} key
 */
const getPackageMapping = (key) => {
  const newKey = packageMapping[key]
  if (newKey) return newKey
  return key
}

/**
 * Convert a CKAN ckanResource to Frictionless ckanResource.
 * @param {any} ckanResource
 */
const resourceCkanToFrictionless = (ckanResource) => {
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
    const newKey = getResourceMapping(key)
    frictionless[newKey] = value
  })

  return frictionless
}

/**
 * Convert a CKAN Package (Dataset) to Frictionless Package.
 * @param {any} ckanPackage
 */
const packageCkanToFrictionless = (ckanPackage) => {
  const frictionlessResource = {}
  const { extras, maintainer, author } = ckanPackage

  // author, maintainer => contributors
  const contributors = []
  if (!ckanPackage.contributors && (author || maintainer)) {
    if (author) {
      const contrib = {
        title: author,
        role: 'author',
      }
      if (ckanPackage.author_email) contrib.email = ckanPackage.author_email
      contributors.push(contrib)
    }

    if (maintainer) {
      const contrib = {
        title: maintainer,
        role: 'maintainer',
      }
      if (ckanPackage.maintainer_email)
        contrib.email = ckanPackage.maintainer_email
      contributors.push(contrib)
    }
    frictionlessResource.contributors = contributors
  }

  Object.entries(ckanPackage).map(([key, value]) => {
    /**
     * Convert the structure of extras
     * structure of extra item is {key: xxx, value: xxx}
     */
    if (key === 'extras') {
      extras.map(({ key, value }) => {
        try {
          value = JSON.parse(value)
        } catch (error) {
          // do nothing
        }
        frictionlessResource[key] = value
      })
      return
    }

    // Map resources inside dataset
    if (key === 'resources') {
      return (frictionlessResource.resources = value.map((resource) => {
        return resourceCkanToFrictionless(resource)
      }))
    }

    // Tags
    if (key === 'tags' && value.length) {
      return (frictionlessResource.keywords = value.map((tag) => {
        return tag.name
      }))
    }

    // check if the key is removable, if yes skip it
    if (packageKeysToRemove.indexOf(key) > -1) return

    // if the value is null then skip it too
    if (value === null) return

    // get the mapping if applicable
    const newKey = getPackageMapping(key)
    frictionlessResource[newKey] = value
  })

  // Algorithm for licenses
  const { license_id, license_title, license_url } = ckanPackage
  // If there is license info then create a empty object which will be later filled
  if (
    (license_id || license_title || license_url) &&
    !frictionlessResource['licenses']
  ) {
    frictionlessResource['licenses'] = [{}]
  }

  if (license_id) frictionlessResource.licenses[0].name = license_id
  if (license_title) frictionlessResource.licenses[0].title = license_title
  if (license_url) frictionlessResource.licenses[0].path = license_url

  return frictionlessResource
}

module.exports = {
  packageCkanToFrictionless,
  resourceCkanToFrictionless,
}
