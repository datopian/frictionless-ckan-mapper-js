// Test frictionless -> ckan
require('./frictionless-to-ckan.resource.test')
require('./frictionless-to-ckan.package.test')

// Test ckan -> frictionless
require('./ckan-to-frictionless.resource.test')
require('./ckan-to-frictionless.package.test')

// Test ckan -> frictionless -> ckan -> frictionless -> ckan
require('./roundtrip.test')
