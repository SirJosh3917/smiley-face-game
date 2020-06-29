import { Character } from './Character';
import MultiKey from './MultiKey';
export class GunController {
  readonly heldGun: Phaser.GameObjects.Sprite;
  private _keyE: MultiKey;
  bulletGroup: Phaser.GameObjects.Group;

  constructor(
    private readonly _scene: Phaser.Scene,
    private readonly _character: Character,
    private readonly _bulletGroup: Phaser.GameObjects.Group
  ) {
    this.heldGun = this._scene.add.sprite(0, 0, 'held_gun');
    this.heldGun.visible = false;
    this._keyE = new MultiKey(_scene, [Phaser.Input.Keyboard.KeyCodes.E]);
  }

  update(pointer: Phaser.Input.Pointer, camera: Phaser.Cameras.Scene2D.Camera) {
    const worldPosition = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
    
    // get the angle from the player to the pointer
    let angle = Phaser.Math.Angle.BetweenPoints(this._character.sprite, worldPosition);
    const gunAngle = angle;
    
    // set the position to be 20 pixels away from the center of the charcter, based on the angle
    const heldGunPosition = this.distanceFrom(this._character.sprite, 20, angle);
    this.heldGun.setPosition(heldGunPosition.x, heldGunPosition.y);

    // MATH TIME:
    // we want the gun to rotate so that when it's to the right, it'll look right, when it's to the left, it'll look left
    // here are the values "angle" could be

    // -Math.PI / 2
    //   _
    //  / \
    // |Pi | 0
    //  \_/
    // Math.PI / 2

    // so when the angle is above Math.PI, we will subtract it by Math.PI and flip the X so that it looks the same but reversed

    this.heldGun.setFlipX(false);
    if (Math.abs(angle) > Math.PI / 2) {
      if (angle < 0) angle += Math.PI;
      else angle -= Math.PI;
      this.heldGun.setFlipX(true);
    }

    // put the gun in that angle infront of the player
    this.heldGun.setRotation(angle);

    if (this._keyE.isDown()) {

      // we want the bullet to be at the barrel of the gun
      const WIDTH_OF_GUN = 32;
      const bulletPosition = this.distanceFrom(this.heldGun, (WIDTH_OF_GUN / 2), gunAngle);

      const thing = this._scene.matter.add
        .image(bulletPosition.x, bulletPosition.y, 'bullet', null, {
          restitution: 0,
          friction: 0,
          density: 1,
          angle: gunAngle
        })
        .setScale(2, 2);
      
      thing.applyForce(this.distanceFrom({ x: 0, y: 0 }, 8, gunAngle) as Phaser.Math.Vector2);

      this._bulletGroup.add(thing);

      setTimeout(() => {
        thing.destroy();
      }, 1000);
    }
  }

  distanceFrom(point: { x: number, y: number }, units: number, angle: number): { x: number, y: number } {
    return {
      x: point.x + Math.cos(angle) * units,
      y: point.y + Math.sin(angle) * units,
    };
  }
}