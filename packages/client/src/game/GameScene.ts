import { ServerInitPacket } from "@smiley-face-game/api/packets/ServerInit";
import { NetworkClient } from "@smiley-face-game/api/NetworkClient";
// import NetworkGunController from "@/game/guns/NetworkGunController";
import InputPlayerController from "@/game/player/InputPlayerController";
import NetworkPlayerController from "@/game/player/NetworkPlayerController";
import PlayerManager from "@/game/player/PlayerManager";
import Player from "@/game/player/Player";
import TileManager from "@/game/world/TileManager";
import World from "@/game/world/World";
import GameSceneInitializationData from "./GameSceneInitializationData";
import GAME_SCENE_KEY from "./GameSceneKey";
import { TILE_WIDTH, TILE_HEIGHT } from "../scenes/world/Config";
import Editor from "./components/editor/Editor";
import store from "@/ui/redux/store";
import { supplyTextureLoader } from "../ui/redux/actionCreators/blockBar";
import BlockBar from "./blockbar/BlockBar";

export default class GameScene extends Phaser.Scene {
  networkClient!: NetworkClient;
  initPacket!: ServerInitPacket;
  world!: World;
  players!: PlayerManager;
  mainPlayer!: Player;
  editor!: Editor;
  blockBar!: BlockBar;

  constructor() {
    super({
      key: GAME_SCENE_KEY
    })
  }

  init(data: GameSceneInitializationData) {
    this.networkClient = data.networkClient;
    this.initPacket = data.init;
  }

  create() {
    // layers of the world (not to be confused with tile layers)
    let depth = 0;
    const layerVoid = this.add.container().setDepth(depth++);
    const layerTileLayerBackground = this.add.container().setDepth(depth++);
    const layerTileLayerAction = this.add.container().setDepth(depth++);
    const layerBullets = this.add.container().setDepth(depth++);
    const layerStrappedGuns = this.add.container().setDepth(depth++);
    const layerPlayers = this.add.container().setDepth(depth++);
    const layerHeldGuns = this.add.container().setDepth(depth++);
    const layerMainPlayerStrappedGun = this.add.container().setDepth(depth++);
    const layerMainPlayer = this.add.container().setDepth(depth++);
    const layerMainPlayerHeldGun = this.add.container().setDepth(depth++);
    const layerTileLayerForeground = this.add.container().setDepth(depth++);
    const layerTileLayerDecoration = this.add.container().setDepth(depth++);

    const world = new World(this, this.initPacket.size, this.networkClient);
    layerVoid.add(world.void.display.sprite);
    layerTileLayerBackground.add(world.background.display.tilemapLayer);
    layerTileLayerAction.add(world.action.display.tilemapLayer);
    layerTileLayerForeground.add(world.foreground.display.tilemapLayer);
    layerTileLayerDecoration.add(world.decoration.display.tilemapLayer);

    world.deserializeBlocks(this.initPacket.blocks);
    this.world = world;

    const blockBar = new BlockBar(world);
    this.blockBar = blockBar;
    this.editor = new Editor(this, world, blockBar);
    this.physics.world.setBounds(0, 0, this.initPacket.size.width * TILE_WIDTH, this.initPacket.size.height * TILE_HEIGHT);

    const mainPlayerLayers = {
      bullets: layerBullets,
      strappedGuns: layerMainPlayerStrappedGun,
      player: layerMainPlayer,
      heldGun: layerMainPlayerHeldGun
    };

    const otherPlayerLayers = {
      bullets: layerBullets,
      strappedGuns: layerStrappedGuns,
      player: layerPlayers,
      heldGun: layerHeldGuns,
    };

    const players = new PlayerManager(this);
    const controller = new InputPlayerController(this);
    const mainPlayer = players.addPlayer(this.initPacket.playerId, mainPlayerLayers, world, controller, controller);
    mainPlayer.character.body.setPosition(this.initPacket.spawnPosition.x, this.initPacket.spawnPosition.y);
    this.mainPlayer = mainPlayer;

    const camera = this.cameras.main;
    camera.startFollow(mainPlayer.character.body, false, 0.05, 0.05, -16, -16);
    camera.setZoom(1);

    this.physics.world.defaults.debugShowBody = true;
    this.physics.world.defaults.debugShowStaticBody = true;

    this.networkClient.events.onPlayerJoin = (event) => {
      players.addPlayer(
        event.playerId,
        otherPlayerLayers,
        world,
        new NetworkPlayerController(
          event.joinLocation.x,
          event.joinLocation.y
        ),
        null, // new NetworkGunController()
      );
    }

    this.networkClient.events.onPlayerLeave = (event) => {
      players.removePlayer(event.playerId);
    }

    this.networkClient.events.onMovement = (event) => {
      // const controller = players.players.get(event.playerId)!.character.controller as NetworkPlayerController;
      // controller.updatePosition(event.position.x, event.position.y);
      // controller.updateInput(event.inputs.left, event.inputs.right, event.inputs.up);
    }

    this.networkClient.events.onBlockBuffer = async (event) => {
      for (const blockEvent of event.blocks) {
        await this.networkClient.events.triggerEvent(blockEvent);
      }
    }

    this.networkClient.events.onBlockLine = async (event) => {
      this.world.drawLine(event.start, event.end, event.id);
    }

    this.networkClient.events.onBlockSingle = async (event) => {
      this.world.placeBlock(event.position, event.id);
    }

    this.networkClient.events.onEquipGun = async (event) => {
      this.players.onEquipGun(event.playerId, event.equipped);
    }

    this.networkClient.events.onFireBullet = async (event) => {
      this.players.onFireBullet(event.playerId);
    }

    this.networkClient.events.onPickupGun = async (event) => {
      this.players.onPickupGun(event.playerId);
    }
  }
}