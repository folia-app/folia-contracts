var EXODUS2 = artifacts.require('./EXODUS2.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {
  
poems = [
  "Transfixed by Zion\nThe New Jews spam hypertexts,\nLight-sick, Quivering.",
  "The quickest jury now;\nEver golden New form zone,\nNo expectations.",
  "The Ark groans, zags up\namethyst waves. Sea of squares;\njailborn code - next world.",
  "Hyperspectral dawn\nQuakes, beams blaze the jewel face,\nvenomized excess",
  "Zones flex, make new ruins.\nParadise conquistador\nJails veiled by light.",
  "Void arrows, zip like\nlarks, hymns mixing, joy cyphers;\nLiquid Gold Fusion.",
  "Jagged quartz towers,\nPacked above the navy bluffs,\nmix nectar and light.",
  "Verdant Perjury,\nlife, pixellized in ghost loams\nwarps, quickens, recedes.",
  "Nonreal packet maze\nthe jacquard blades of textiles;\nweaving light arrays",
  "Hacked Amazon\nJungle syntax waveform\nDisplaced by squares",
  "Quadratic Empire\nWe wove the megajoule helix\nblock by freezing block.",
  "Jinxed light-life ends;\nQuit, Respawn. Shadow playback,\nvenom horizon.",
  "subtropical shrines;\nhajiis, pixels liquidized\nwalk the lucent graves",
  "Body juts, friezed.\nfaqirs seek exemption, wilt -\nVibe Sarcophagi.",
  "Flesh, triumphal grave.\nHelix wreck, joyless, oblique;\nOzymandias.",
  "The fog of junk psalms\nRequests to the wreck reflex\nHypnotized blank verse",
  "About Plato's cave\nText jets quilt the azure sky \nwith glissando foam",
  "Darkness, refresh view\nComing flux; Onyx, Jasper\nThe Bezel \xc3\x89poque.",
  "Hijacked forms, waves\nBody poem, dazzling equinox\nSelbstverselbstlichung."
]
    deployer.then(async () => {
    try {

      // Deploy EXODUS2.sol
      await deployer.deploy(EXODUS2)
      let exodus2 = await EXODUS2.deployed()
      console.log(_ + 'EXODUS2 deployed at: ' + exodus2.address)
      console.log({exodus2})
      for (i = 0; i < 20; i++) {
        await exodus2.addPoem(poems[i])
      }
      

    } catch (error) {
      console.log(error)
    }
  })
}