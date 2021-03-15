export * from './typechain';
export * from './utils';

var Folia = require('./build/contracts/Folia.json')
var FoliaController = require('./build/contracts/FoliaController.json')
var Metadata = require('./build/contracts/Metadata.json')

module.exports = {
  Folia,
  FoliaController,
  Metadata
}
