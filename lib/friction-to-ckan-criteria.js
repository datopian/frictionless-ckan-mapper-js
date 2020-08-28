const mapCriteria = (field) => {
  return {
    mapping: field,
    process: (value) => value,
    extract: () => {},
  }
}

const licenseCriteria = () => {
  return {
    mapping: null,
    process: (value) => value,
    extract: (licenses, keyName) => {
      let extract = {}
      /**
       * Attach the first license to the object.
       */
      if (licenses.length) {
        const { title, path, name } = licenses[0]
        if (title) extract.license_title = title
        if (path) extract.license_url = path
        if (name) extract.license_id = name
      }

      // if there is more than one license then create the extras
      if (licenses.length > 1) {
        extract.extras = [
          {
            key: keyName,
            value: licenses,
          },
        ]
      }

      return extract
    },
  }
}

const contributorsCriteria = () => {
  return {
    mapping: null,
    process: () => {},
    extract: (contributors, keyName) => {
      let extract = {}
      contributors.map((contributor) => {
        const { email, title, role } = contributor
        // find the first author and attach the information to the object
        if (title && !extract.author && (role === 'author' || !role)) {
          extract.author = title
          if (email !== undefined) extract.author_email = email
        }
        // the same for maintainer
        if (role === 'maintainer') {
          extract.maintainer = title
          if (email !== undefined) extract.maintainer_email = email
        }
      })

      // if there is more than one contributor then create the extras
      if (contributors.length > 2) {
        extract.extras = [
          {
            key: keyName,
            value: contributors,
          },
        ]
      }

      return extract
    },
  }
}

const extrasCriteria = () => {
  return {
    mapping: null,
    process: (value) => value,
    extract: (value, keyName) => {
      return {
        extras: [
          {
            key: keyName,
            value: value,
          },
        ],
      }
    },
  }
}

/**
 * Returns criteria for the resource based on the given `fieldName`.
 * See getPackageCriteria() for more details
 * @param {string} fieldName
 */
const getResourceCriteria = (fieldName) => {
  switch (fieldName) {
    // passes through
    case 'data':
      return mapCriteria('data')
    case 'description':
      return mapCriteria('description')
    case 'encoding':
      return mapCriteria('encoding')
    case 'format':
      return mapCriteria('format')
    case 'hash':
      return mapCriteria('hash')

    // maps
    case 'bytes':
      return mapCriteria('size')
    case 'mediatype':
      return mapCriteria('mimetype')

    default:
      // if the criteria is not found for the given key
      // then find in package criteria
      const criteria = getPackageCriteria(fieldName, true)
      // if here is not found either then passthrough
      if (!criteria) return mapCriteria(fieldName)
      return criteria
  }
}

/**
 *
 * Returns object which represents the criteria based on which
 * the source package will be converted to CKAN.
 * - `mapping` is the new property name of target (CKAN) object.
 * - `process` process the value decides whether to passthrough or change it.
 * - `extract` extracts the properties and generate new value accordingly if applicable.
 * @param {string} fieldName
 * @param {false} skipExtras - Controls whether to fallback to extras criteria or not
 */
const getPackageCriteria = (fieldName, skipExtras) => {
  switch (fieldName) {
    // passes through
    case 'name':
      return mapCriteria('name')
    case 'path':
      return mapCriteria('url')
    case 'title':
      return mapCriteria('title')
    case 'version':
      return mapCriteria('version')
    case 'owner_org':
      return mapCriteria('owner_org')
    case 'metadata_created':
      return mapCriteria('metadata_created')
    case 'metadata_modified':
      return mapCriteria('metadata_modified')
    case 'creator_user_id':
      return mapCriteria('creator_user_id')
    case 'private':
      return mapCriteria('private')
    case 'revision_id':
      return mapCriteria('revision_id')
    case 'id':
      return mapCriteria('id')

    // maps
    case 'description':
      return mapCriteria('notes')
    case 'homepage':
      return mapCriteria('url')

    // maps and processes
    case 'keywords':
      return {
        mapping: 'tags',
        extract: (value) => {},
        process: (keywords) => {
          return keywords.map((keyword) => {
            return {
              name: keyword,
            }
          })
        },
      }

    // maps, process and adds new props
    case 'licenses':
      return licenseCriteria()

    case 'contributors':
      return contributorsCriteria()

    default:
      if (!skipExtras)
        // if the criteria is not found for the given key
        // then use extra criteria as a default
        return extrasCriteria()
  }
}

module.exports = { getPackageCriteria, getResourceCriteria }
