import { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import { Container } from "pixi.js";
import Players from "../Players";
import { playerList } from "../../recoil/atoms/playerList";
import ClientPlayer from "./components/ClientPlayer";

export default class ClientPlayers extends Players {
  constructor(readonly players: Container) {
    super(ClientPlayer);
  }

  addPlayer(joinInfo: ZSPlayerJoin): ClientPlayer {
    const player = super.addPlayer(joinInfo) as ClientPlayer;
    // TODO: cleanup state management so this doesn't need to exist (ideally recoil should
    // fetch values from the game itself or something)
    player.onRoleChange = (previous, current) => {
      playerList.modify({
        players: [
          ...playerList.state.players.filter((p) => p.playerId !== player.id),
          {
            playerId: player.id,
            role: current,
            username: player.username,
          },
        ],
      });
    };
    this.players.addChildAt(player.container, 0);
    playerList.modify({
      players: [
        ...playerList.state.players,
        {
          playerId: player.id,
          role: player.role,
          username: player.username,
        },
      ],
    });
    return player;
  }

  removePlayer(id: number): ClientPlayer {
    const player = super.removePlayer(id) as ClientPlayer;
    return player;
  }

  cleanup() {
    playerList.set({
      players: [],
    });
  }
}
