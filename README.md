# Frictionless CKAN Mapper for JS

![Node.js CI](https://github.com/datopian/frictionless-ckan-mapper-js/workflows/Node.js%20CI/badge.svg)

This is JS version of [Frictionless CKAN Mapper](https://github.com/frictionlessdata/frictionless-ckan-mapper).

A library for mapping CKAN metadata <=> Frictionless metadata.

## Install

`yarn add frictionless-ckan-mapper-js`

or

`npm i frictionless-ckan-mapper-js`

If you use AMD, UMD, Commonjs or just need the script in browser then install via one of the above commands and then under `node_modules/frictionless-ckan-mapper-js/dist/` folder you can find the appropriate `frictionless-ckan-mapper.[TARGET NAME].js` library. you can use `frictionless-ckan-mapper.var.js` to load it in the browser which brings `frictionlessCkanMapper` global variable

## Use

In **Node**

```js
const frictionlessCkanMapper = require('frictionless-ckan-mapper')
```

In **Browser**

```html
<!DOCTYPE html>
<html>
  ...
  <script src="https://unpkg.com/frictionless-ckan-mapper-js/dist/frictionless-ckan-mapper.var.js"></script>
  <script>
    // ...
    // frictionlessCkanMapper library is available here
    // ...
  </script>
</html>
```

## Examples

Converting frictionless resource spec to ckan package spec

```js
const frictionlessResource = {
  name: 'data.csv',
  path: 'http://someplace.com/data.csv',
  bytes: 100,
  mediatype: 'text/csv',
}

const ckanResource = frictionlessCkanMapper.resourceFrictionlessToCkan(
  frictionlessResource
)

console.log(ckanResource)
// {
//   name: 'data.csv',
//   url: 'http://someplace.com/data.csv',
//   size: 100,
//   mimetype: 'text/csv'
// }
```

Converting frictionless package spec to ckan package spec

```js
const frictionlessPackage = {
  name: 'gdp',
  description: 'Country, regional and world GDP in current USD.',
  homepage: 'https://datopian.com',
  title: 'Countries GDP',
  version: '1.0',
  newdict: { key1: 'dict_to_jsonify' },
  newint: 123,
  resources: [
    {
      name: 'data.csv',
      path: 'http://someplace.com/data.csv',
      bytes: 100,
    },
  ],
}

const ckanPackage = frictionlessCkanMapper.packageFrictionlessToCkan(
  frictionlessPackage
)

console.log(ckanPackage)
// {
//     name: 'gdp',
//     notes: 'Country, regional and world GDP in current USD.',
//     url: 'https://datopian.com',
//     title: 'Countries GDP',
//     version: '1.0',
//     extras: [
//       { key: 'newdict', value: [Object] },
//       { key: 'newint', value: 123 }
//     ],
//     resources: [
//       {
//         name: 'data.csv',
//         url: 'http://someplace.com/data.csv',
//         size: 100
//       }
//     ]
//   }
```

## Sources

[Frictionless - Mappings from Other Formats to Frictionless both Profiles and Schemas](https://docs.google.com/spreadsheets/d/1XdqGTFni5Jfs8AMbcbfsP7m11h9mOHS0eDtUZtqGVSg/edit#gid=1925460244)

## Contributing

Please make sure to read the [CONTRIBUTING.md](/.github/CONTRIBUTING.md) Guide before making a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](License) file for details
