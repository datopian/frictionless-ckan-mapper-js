/**
 * Package Frictionless->CKAN
 */

const passthroughCriteria = (field) => {
  return {
    mapping: field,
    process: (value) => value,
    extract: () => {},
  }
}

/**
 * Each element in the object represent the criteria based on which
 * the source package will be converted to CKAN.
 * The property name represent the field name of the source.
 * - `mapping` is the new property name of target (CKAN) object.
 * - `process` process the value decides whether to passthrough or change it.
 * - `extract` extracts the properties and generate new value accordingly if applicable.
 *   It represents objects which properties will be new properties.
 */
const criteriaList = {
  name: passthroughCriteria('name'),
  title: passthroughCriteria('title'),
  description: {
    mapping: 'notes',
    process: (value) => value,
    extract: (value) => {},
  },
  homepage: {
    mapping: 'url',
    process: (value) => value,
    extract: (value) => {},
  },
  id: passthroughCriteria('id'),
  keywords: {
    mapping: 'tags',
    extract: (value) => {},
    process: (keywords) => {
      return keywords.map((keyword) => {
        return {
          name: keyword,
        }
      })
    },
  },

  licenses: {
    mapping: 'licenses',
    process: (value) => value,
    extract: (licenses) => {
      let extract = {}
      for (let license of licenses) {
        /**
         * find the first id and then attach it along with
         * title to the object.
         */
        const { id, title } = license
        if (id) extract.license_id = id
        if (title) extract.license_title = title
        break
      }

      return extract
    },
  },

  contributors: {
    mapping: null,
    process: () => {},
    extract: (contributors) => {
      let extract = {}
      contributors.map((contributor) => {
        const { email, title, role } = contributor
        // find the author and attach the information to the object
        if (role === 'author') {
          Object.assign(extract, {
            author: title,
            author_email: email,
          })
        }
        // the same for maintainer
        if (role === 'maintainer') {
          Object.assign(extract, {
            maintainer: title,
            maintainer_email: email,
          })
        }
      })

      return extract
    },
  },

  resources: passthroughCriteria('resources'),
}

module.exports = { criteriaList, passthroughCriteria }
