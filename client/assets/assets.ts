
//@ts-ignore
import urlAtlas from "./atlas.png";
//@ts-ignore
import urlAtlasJson from "./atlas_atlas.json";
//@ts-ignore
import urlBullet from "./bullet.png";
//@ts-ignore
import urlHeldGun from "./held_gun.png";
//@ts-ignore
import urlPlayer from "./mmmyep.png";

/**
 * @param {Phaser.Loader.LoaderPlugin} loader 
 */
export function loadAll(loader) {
  loader.atlas("atlas", urlAtlas, urlAtlasJson);
  loader.image("player", urlPlayer);
  loader.image("held_gun", urlHeldGun);
  loader.image("bullet", urlBullet);
}
