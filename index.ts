export * from './typechain';
export * from './utils';

var Folia = require('./build/contracts/Folia.json')
var FoliaController = require('./build/contracts/FoliaController.json')
var FoliaControllerV2 = require('./build/contracts/FoliaControllerV2.json')
var Metadata = require('./build/contracts/Metadata.json')
var ReserveAuction = require('./build/contracts/ReserveAuction.json')
var FoliaAuction = require('./build/contracts/FoliaAuction.json')
var DotComSeance = require('./build/contracts/DotComSeance.json')
var DotComSeanceMetadata = require('./build/contracts/DotComSeanceMetadata.json')
var DotComSeanceController = require('./build/contracts/DotComSeanceController.json')

module.exports = {
  Folia,
  FoliaController,
  FoliaControllerV2,
  Metadata,
  ReserveAuction,
  FoliaAuction,
  DotComSeance,
  DotComSeanceMetadata,
  DotComSeanceController
}
