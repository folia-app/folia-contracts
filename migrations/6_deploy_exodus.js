var EXODUS2 = artifacts.require('./EXODUS2.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {
  
pangrams = [ `Transfixed by Zion
The New Jews spam hypertexts,
Light-sick, Quivering.`,

  `The quickest jury now;
  Ever golden New form zone,
  No expectations.`,
  
  `The Ark groans, zags up
  amethyst waves. Sea of squares;
  jailborn code - next world.`,
  
  `Hyperspectral dawn
  Quakes, beams blaze the jewel face,
  venomized excess.`,
  
  `Zones flex, make new ruins.
  Paradise conquistadors
  Jails veiled by light.`,
  
  `Void arrows, zip like
  larks, hymns mixing, joy cyphers;
  Liquid Gold Fusion.`,
  
  `Jagged quartz towers,
  Packed above the navy bluffs,
  mix nectar and light.`,
  
  `Verdant Perjury;
  life, pixellized in ghost loams
  warps, quickens, recedes.`,
  
  `Nonreal packet maze
  The jacquard blades of textiles
  weaving light arrays.`,
  
  `Hacked Amazon
  Jungle syntax waveform, now
  displaced by squares.`,
  
  `Quadratic Empire;
  Megajoule helix woven
  block by freezing block.`,
  
  `Jinxed lightlife ends;
  Quit, Respawn. Shadow playback,
  venom horizon.`,
  
  `Subtropical shrines;
  hajiis, pixels liquidized
  walk the lucent graves.`,
  
  `Body juts, friezed.
  faqirs seek exemption, wilt -
  Vibe Sarcophagi.`,
  
  `Flesh, triumphal grave.
  Helix wreck, joyless, oblique;
  Ozymandias.`,
  
  `The fog of junk psalms
  Requests to the wreck reflex
  Hypnotized blank verse.`,
  
  `About Plato's cave
  Text jets quilt the azure sky 
  with glissando foam.`,
  
  `Darkness, refresh view
  Coming flux; Onyx, Jasper
  The Bezel Époque.`,
  
  `Hijacked forms, waves
  Body poem, dazzling equinox
  Selbstverselbstlichung.`
  
]
    deployer.then(async () => {
    try {

      // Deploy EXODUS2.sol
      await deployer.deploy(EXODUS2)
      let exodus2 = await EXODUS2.deployed()
      console.log(_ + 'EXODUS2 deployed at: ' + exodus2.address)
      for (i = 0; i < 20; i++) {
        await exodus2.deploy(pangrams[i])
      }
      

    } catch (error) {
      console.log(error)
    }
  })
}