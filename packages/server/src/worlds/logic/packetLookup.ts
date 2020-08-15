import { WorldPacketLookup } from "@smiley-face-game/api/src/networking/packets/WorldPacket";
import RoomLogic from "@/worlds/logic/RoomLogic";
import Connection from "@/websockets/Connection";
import handleServer from "./handlers/handleServer";
import handleBlockBuffer from "./handlers/handleBlockBuffer";
import handleBlockLine from "./handlers/handleBlockLine";
import handleBlockSingle from "./handlers/handleBlockSingle";
import handleEquipGun from "./handlers/handleEquipGun";
import handleFireBullet from "./handlers/handleFireBullet";
import handleMovement from "./handlers/handleMovement";
import handlePickupGun from "./handlers/handlePickupGun";

const packetLookup: WorldPacketLookup<[Connection, RoomLogic], void | Promise<void>> = {
  BLOCK_BUFFER: handleBlockBuffer,
  BLOCK_LINE: handleBlockLine,
  BLOCK_SINGLE: handleBlockSingle,
  EQUIP_GUN: handleEquipGun,
  FIRE_BULLET: handleFireBullet,
  MOVEMENT: handleMovement,
  PICKUP_GUN: handlePickupGun,

  SERVER_INIT: handleServer,
  SERVER_BLOCK_BUFFER: handleServer,
  SERVER_BLOCK_LINE: handleServer,
  SERVER_BLOCK_SINGLE: handleServer,
  SERVER_EQUIP_GUN: handleServer,
  SERVER_FIRE_BULLET: handleServer,
  SERVER_MOVEMENT: handleServer,
  SERVER_PICKUP_GUN: handleServer,
  SERVER_PLAYER_JOIN: handleServer,
  SERVER_PLAYER_LEAVE: handleServer,
};

export default packetLookup;