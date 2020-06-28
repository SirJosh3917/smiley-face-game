import { TileId } from '../libcore/core/models/TileId.ts';
import { TileLayer } from '../libcore/core/models/TileLayer.ts';
import { UserId } from "../libcore/core/models/UserId.ts";
import { BlockSinglePacket, BLOCK_SINGLE_ID } from "../libcore/core/networking/game/BlockSingle.ts";
import { MovementPacket, MOVEMENT_ID } from "../libcore/core/networking/game/Movement.ts";
import { ServerBlockSinglePacket, SERVER_BLOCK_SINGLE_ID } from "../libcore/core/networking/game/ServerBlockSingle.ts";
import { SERVER_INIT_ID } from "../libcore/core/networking/game/ServerInit.ts";
import { ServerMovementPacket, SERVER_MOVEMENT_ID } from "../libcore/core/networking/game/ServerMovement.ts";
import { SERVER_PLAYER_JOIN_ID } from "../libcore/core/networking/game/ServerPlayerJoin.ts";
import { SERVER_PLAYER_LEAVE_ID } from "../libcore/core/networking/game/ServerPlayerLeave.ts";
import { invokeWorldPacketLookup, WorldPacket, WorldPacketLookup } from "../libcore/core/networking/game/WorldPacket.ts";
import { AllowJoin } from "./AllowJoin.ts";
import { User } from "./User.ts";
import { ValidMessage } from "./ValidMessage.ts";

export class World {
  private readonly _lookup: WorldPacketLookup<User, Promise<ValidMessage>>;
  readonly users: Map<UserId, User>;
  private readonly _map: TileId[][][];

  constructor(
    private readonly _width: number,
    private readonly _height: number,
    readonly destroy: () => void,
  ) {
    //@ts-ignore
    this._lookup = {
      //@ts-ignore
      [BLOCK_SINGLE_ID]: this.onBlockSingle.bind(this),
      //@ts-ignore
      [MOVEMENT_ID]: this.onMovement.bind(this),
      [SERVER_INIT_ID]: this.badPacket.bind(this),
      [SERVER_MOVEMENT_ID]: this.badPacket.bind(this),
      [SERVER_PLAYER_JOIN_ID]: this.badPacket.bind(this),
      [SERVER_PLAYER_LEAVE_ID]: this.badPacket.bind(this),
      [SERVER_BLOCK_SINGLE_ID]: this.badPacket.bind(this),
    };

    this.users = new Map<UserId, User>();

    this._map = [];
    for (let layer = 0; layer <= 1; layer++) {
      let layerMap: TileId[][] = [];
      this._map[layer] = layerMap;

      for (let y = 0; y < _height; y++) {
        let yMap: TileId[] = [];
        layerMap[y] = yMap;

        for (let x = 0; x < _width; x++) {
          if (layer === TileLayer.Background) {
            yMap[x] = TileId.Empty;
            continue;
          }
          
          // TODO: cleanup border initialization stuff
          let xMap: TileId = (y === 0 || y === _height - 1 || x === 0 || x === _width - 1) ? 1 : 0;
          yMap[x] = xMap; 
        }
      }
    }

    // put a gun in the middle of the floor
    let widthMiddle = (_width / 2) | 0; // |0 basically casts to int, see asmjs
    this._map[TileLayer.Background][_height - 2][widthMiddle] = TileId.Gun;
  }

  // as this is the lobby, we don't need to worry about 
  async handleJoin(user: User): Promise<AllowJoin> {
    if (this.users.size >= 40) return AllowJoin.PreventJoin;

    // tell everyone else about the new player joining
    await this.broadcast({
      packetId: SERVER_PLAYER_JOIN_ID,
      userId: user.userId,
      joinLocation: {
        x: 32 + 16,
        y: 32 + 16
      }
    });
    
    // tell the new user about the world
    await user.send({
      packetId: SERVER_INIT_ID,
      size: { width: this._width, height: this._height },
      blocks: this._map
    });

    for (const otherUser of this.users.values()) {
      // tell the new user about everyone here
      await user.send({
        packetId: SERVER_PLAYER_JOIN_ID,
        userId: otherUser.userId,
        joinLocation: otherUser.lastPosition,
      });
    }

    // add them to the list of people
    this.users.set(user.userId, user);
    return AllowJoin.PermitJoin;
  }

  async handleLeave(user: User): Promise<void> {
    this.users.delete(user.userId);

    if (this.users.size === 0) {
      this.destroy();
      return;
    }

    // notify everyone that the last user has left
    await this.broadcast({
      packetId: SERVER_PLAYER_LEAVE_ID,
      userId: user.userId
    });
  }

  handleMessage(sender: User, message: WorldPacket): Promise<ValidMessage> {
    return invokeWorldPacketLookup(this._lookup, message, sender);
  }

  private badPacket(packet: WorldPacket, sender: User): Promise<ValidMessage> {
    return Promise.resolve(ValidMessage.IsNotValidMessage);
  }

  private async onBlockSingle(packet: BlockSinglePacket, sender: User): Promise<ValidMessage> {

    // TODO: make incoming schemas check for y and x out of bounds
    if (packet.position.y >= this._height || packet.position.x >= this._width) {
      sender.kill();
      return ValidMessage.IsNotValidMessage;
    }

    this._map[packet.layer][packet.position.y][packet.position.x] = packet.id;

    const response: ServerBlockSinglePacket = {
      ...packet,
      packetId: SERVER_BLOCK_SINGLE_ID,
      sender: sender.userId,
    };

    await this.broadcast(response);
    return ValidMessage.IsValidMessage;
  }

  private async onMovement(packet: MovementPacket, sender: User): Promise<ValidMessage> {
    // TODO: does destructuring include non-required data? if so, this could be a mild vulnerability
    sender.lastPosition = { ...packet.position };

    const response: ServerMovementPacket = {
      ...packet,
      packetId: SERVER_MOVEMENT_ID,
      sender: sender.userId,
    };

    await this.broadcast(response);

    return ValidMessage.IsValidMessage;
  }

  private async broadcast(packet: WorldPacket): Promise<void> {
    // let promises: Promise<void>[] = [];

    for (const user of this.users.values()) {
      await user.send(packet);
    }

    // return Promise.all(promises);
  }
}
