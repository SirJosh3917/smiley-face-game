import { BlockSinglePacket } from "@smiley-face-game/api/networking/packets/BlockSingle";
import Connection from "@/websockets/Connection";
import RoomLogic from "@/worlds/logic/RoomLogic";

export default function handleBlockSingle(packet: BlockSinglePacket, [sender, logic]: [Connection, RoomLogic]) {
  throw new Error("not implemented");
}