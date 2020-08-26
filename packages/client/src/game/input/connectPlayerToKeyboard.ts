import { NetworkClient } from "@smiley-face-game/api/NetworkClient";
import Player from "@/game/player/Player";

function hook(player: Player, keyboardEvent: number, onUp: (player: Player) => void, onDown: (player: Player) => void) {
  const keyObj = player.game.input.keyboard.addKey(keyboardEvent);
  keyObj.on("down", () => onUp(player));
  keyObj.on("up", () => onDown(player));
}

export default function connectPlayerToKeyboard(player: Player, networkClient: NetworkClient) {
  const { UP, LEFT, RIGHT, W, A, D, SPACE, E } = Phaser.Input.Keyboard.KeyCodes;

  // allows us to wrap any (player) => void action and then send a movement packet afterwords
  const sendMovePacket = (closure: (player: Player) => void) => (player: Player) => {
    closure(player);
    networkClient.move(player.character.body, player.character.body.body.velocity, player.character.input);
  };

  const jumpOn = sendMovePacket((player) => player.character.updateInputs({ jump: true }));
  const jumpOff = sendMovePacket((player) => player.character.updateInputs({ jump: false }));
  const leftOn = sendMovePacket((player) => player.character.updateInputs({ left: true }));
  const leftOff = sendMovePacket((player) => player.character.updateInputs({ left: false }));
  const rightOn = sendMovePacket((player) => player.character.updateInputs({ right: true }));
  const rightOff = sendMovePacket((player) => player.character.updateInputs({ right: false }));

  hook(player, SPACE, jumpOn, jumpOff);
  hook(player, UP, jumpOn, jumpOff);
  hook(player, W, jumpOn, jumpOff);

  hook(player, LEFT, leftOn, leftOff);
  hook(player, A, leftOn, leftOff);

  hook(player, RIGHT, rightOn, rightOff);
  hook(player, D, rightOn, rightOff);
}