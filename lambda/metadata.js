exports.handler = function(event, context, callback) {
  const tokenId = event.queryStringParameters.tokenId


  // this would be your own api with rich data and actual information about the artworks
  // cosnt storedMetadata = axios('https://mydatabase.com/storageSystem/'+tokenId)

  const metadata =  {

    // both opensea and rarebits
    "name": "Token #" + tokenId, 
    "description": "This is a very basic NFT with token Id #" + tokenId,
      
    // opensea
    "external_url": process.env.APP_URL,
    // rarebits
    "home_url": process.env.APP_URL, 

    // opensea
    "image": "https://dummyimage.com/600x400/000/fff/&text=token%20" + tokenId, 
    // rarebits
    "image_url": "https://dummyimage.com/600x400/000/fff/&text=token%20" + tokenId, 

    // opensea
    "attributes": [ 
      {
        "trait_type": "zodiac", 
        "value": returnZodiac(tokenId)
      }
    ],
    // rarebits
    "properties": [ 
      {"key": "zodiac", "value": returnZodiac(tokenId), type: "string"}, 
    ],

    // rarebits
    "tags": ["cool","hot","mild"]
  } 
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(metadata)
  });
};
function returnZodiac(tokenId) {
  const month = ((tokenId - 1) % 12) + 1
  switch(month) {
    case(1):
      return 'Capricorn'
    case(2):
      return 'Aquarius'
    case(3):
      return 'Pisces'
    case(4):
      return 'Aries'
    case(5):
      return 'Taurus'
    case(6):
      return 'Gemini'
    case(7):
      return 'Cancer'
    case(8):
      return 'Leo'
    case(9):
      return 'Virgo'
    case(10):
      return 'Libra'
    case(11):
      return 'Scorpio'
    case(12):
      return 'Sagittarius'
  }
}