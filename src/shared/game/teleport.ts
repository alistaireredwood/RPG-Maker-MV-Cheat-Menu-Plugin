export function teleport(mapId: number, x: number, y: number): void {
  $gamePlayer.reserveTransfer(mapId, x, y, $gamePlayer.direction(), 0);
  $gamePlayer.setPosition(x, y);
}
