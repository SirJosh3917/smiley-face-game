import type { ZPlayerListAction } from "@smiley-face-game/api/packets";
import type Connection from "../../../worlds/Connection";
import type RoomLogic from "../../../worlds/logic/RoomLogic";

export default function handlePlayerlistAction(packet: ZPlayerListAction, [sender, logic]: [Connection, RoomLogic]) {
  switch (packet.action.action) {
    case "give edit":
      {
        // TODO: make this a property instead of manually comparing role for cleanliness
        if (sender.role !== "owner") return false;

        // TODO: wrap this outside or something
        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;
        if (target.role === "owner") return; // TODO: when permissions aren't role-based, check if they already have edit

        target.role = "edit";
        target.hasEdit = true;
        logic.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.playerId,
          newRole: "edit",
        });
      }
      return;

    case "remove edit":
      {
        if (sender.role !== "owner") return false;

        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;
        if (target.role === "owner") return; // TODO: when permissions aren't role-based, remove this check and remove edit from owner

        target.role = "non";
        target.hasEdit = false;
        logic.broadcast({
          packetId: "SERVER_ROLE_UPDATE",
          playerId: target.playerId,
          newRole: "non",
        });
      }
      return;

    case "kick":
      {
        if (sender.role !== "owner") return false;

        const target = logic.player(packet.action.playerId);
        if (target === undefined) return;

        target.kill("kicked");
      }
      return;
  }
}
