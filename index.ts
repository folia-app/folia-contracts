export * from './typechain';
export * from './utils';

var Folia = require('./build/contracts/Folia.json')
var FoliaController = require('./build/contracts/FoliaController.json')
var FoliaControllerV2 = require('./build/contracts/FoliaControllerV2.json')
var Metadata = require('./build/contracts/Metadata.json')
var ReserveAuction = require('./build/contracts/ReserveAuction.json')
var FoliaAuction = require('./build/contracts/FoliaAuction.json')
var DeadDotComSeance = require('./build/contracts/DeadDotComSeance.json')
var DeadDotComSeanceMetadata = require('./build/contracts/DeadDotComSeanceMetadata.json')
var DeadDotComSeanceController = require('./build/contracts/DeadDotComSeanceController.json')

module.exports = {
  Folia,
  FoliaController,
  FoliaControllerV2,
  Metadata,
  ReserveAuction,
  FoliaAuction,
  DeadDotComSeance,
  DeadDotComSeanceMetadata,
  DeadDotComSeanceController
}
