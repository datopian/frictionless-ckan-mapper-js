/**
 *
 * Any key not in this list is passed as is inside "extras".
 * Further processing will happen for possible matchings, e.g.
 * contributor <=> author
 *  */
const ckanPackageKeys = [
  'author',
  'author_email',
  'creator_user_id',
  'groups',
  'id',
  'license_id',
  'license_title',
  'license_url',
  'maintainer',
  'maintainer_email',
  'metadata_created',
  'metadata_modified',
  'name',
  'notes',
  'owner_org',
  'private',
  'relationships_as_object',
  'relationships_as_subject',
  'revision_id',
  'resources',
  'state',
  'tags',
  'tracking_summary',
  'title',
  'type',
  'url',
  'version',
]

const resourceMapping = {
  bytes: 'size',
  mediatype: 'mimetype',
  path: 'url',
}

const packageMapping = {
  description: 'notes',
  homepage: 'url',
}

const frictionlessPackageKeysToExclude = ['extras']

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
 * Converts the Frictionless resource to a CKAN package (dataset)
 * @param {Object} frictionlessResource
 */
const resourceFrictionlessToCkan = (frictionlessResource) => {
  const newResource = {}
  Object.entries(frictionlessResource).map(([key, value]) => {
    // get the mapping is applicable
    const newKey = getResourceMapping(key)
    newResource[newKey] = value
  })

  return newResource
}

/**
 * Converts the Frictionless package to a CKAN package (dataset)
 * @param {Object} frictionlessPackage
 */
const packageFrictionlessToCkan = (frictionlessPackage) => {
  const ckanPackage = {}

  Object.entries(frictionlessPackage).map(([key, value]) => {
    // Map resources inside dataset
    if (key === 'resources') {
      return (ckanPackage.resources = value.map((resource) => {
        return resourceFrictionlessToCkan(resource)
      }))
    }

    if (key === 'licenses' && value && value.length) {
      const { title, path, name } = value[0]
      if (title) ckanPackage.license_title = title
      if (path) ckanPackage.license_url = path
      if (name) ckanPackage.license_id = name

      // Skip licenses array so it won't get put in extras
      if (value.length === 1) return
    }

    const contributors = value
    if (key === 'contributors' && contributors && contributors.length) {
      // find the author and maintainer
      for (let contrib of contributors) {
        const { title, email, role } = contrib
        if (!role || role === 'author') {
          ckanPackage.author = title
          ckanPackage.author_email = email
          break
        }
      }

      for (let contrib of contributors) {
        const { title, email, role } = contrib
        if (role === 'maintainer') {
          ckanPackage.maintainer = title
          ckanPackage.maintainer_email = email
          break
        }
      }

      /**
       * we skip contributors where we have extracted everything into
       * ckan core that way it won't end up in extras
       * this helps ensure that round tripping with ckan is good
       * when have we extracted everything?
       * if contributors has length 1 and role in author or maintainer
       * or contributors == 2 and no of authors and maintainer types <= 1
       */
      if (contributors) {
        if (
          contributors.length === 1 &&
          (!contributors[0].role ||
            contributors[0].role === 'author' ||
            contributors[0].role === 'maintainer')
        )
          return
        if (contributors.length === 2) {
          let authorsCount = 0
          let maintainersCount = 0
          contributors.map((contributor) => {
            const { role } = contributor
            if (role === 'authors') authorsCount++
            if (role === 'maintainer') maintainersCount++
          })

          if (authorsCount < 2 && maintainersCount < 2) return
        }
      }
    }

    // Map keywords to tags
    if (key == 'keywords') {
      return (ckanPackage.tags = value.map((keyword) => {
        return { name: keyword }
      }))
    }

    // get the mapping if applicable
    const newKey = getPackageMapping(key)

    // Creating extras. If it is not ckan key and neither excluded frictionless key
    if (
      ckanPackageKeys.indexOf(newKey) < 0 &&
      frictionlessPackageKeysToExclude.indexOf(newKey) < 0
    ) {
      ckanPackage.extras = ckanPackage.extras || []
      if (typeof value === 'object') value = JSON.stringify(value)
      return ckanPackage.extras.push({ key, value })
    }

    ckanPackage[newKey] = value
  })

  return ckanPackage
}

module.exports = {
  packageFrictionlessToCkan,
  resourceFrictionlessToCkan,
}
