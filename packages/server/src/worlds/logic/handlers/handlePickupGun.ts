import type { ZPickupGun } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";
import { TileLayer } from "@smiley-face-game/api/types";
import TileJson from "packages/server/src/worlds/TileJson";

export default function handlePickupGun(packet: ZPickupGun, [sender, logic]: [Connection, RoomLogic]) {
  // only allow collection of gun if it exists at specified location
  if (logic.blockHandler.map[TileLayer.Action][packet.position.y][packet.position.x] !== TileJson.id("gun")) {
    // we don't want to say this was invalid, because someone could've broke the gun block while someone else was trying to collect it.
    return;
  }

  sender.hasGun = true;
  sender.gunEquipped = true;

  logic.broadcast({
    packetId: "SERVER_PICKUP_GUN",
    playerId: sender.playerId!,
  });
}
