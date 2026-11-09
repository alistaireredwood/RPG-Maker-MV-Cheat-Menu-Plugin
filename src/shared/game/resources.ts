export type Resource = 'HP' | 'MP' | 'TP';
export type ResourceChange = 'zero' | 'one' | 'half' | 'full';

const RESOURCES: Record<
  Resource,
  {
    max: (b: Game_Battler) => number;
    set: (b: Game_Battler, value: number) => void;
    halfFloor: number;
  }
> = {
  // half HP never kills
  HP: { max: (b) => b.mhp, set: (b, v) => b.setHp(v), halfFloor: 1 },
  MP: { max: (b) => b.mmp, set: (b, v) => b.setMp(v), halfFloor: 0 },
  TP: { max: (b) => b.maxTp(), set: (b, v) => b.setTp(v), halfFloor: 0 },
};

function targetValue(
  battler: Game_Battler,
  resource: Resource,
  change: ResourceChange,
): number {
  const { max, halfFloor } = RESOURCES[resource];
  switch (change) {
    case 'zero':
      return 0;
    case 'one':
      return 1;
    case 'half':
      return Math.max(halfFloor, Math.floor(max(battler) / 2));
    case 'full':
      return max(battler);
  }
}

export function changeResource(
  battlers: readonly (Game_Battler | null | undefined)[],
  resource: Resource,
  change: ResourceChange,
  aliveOnly: boolean,
): void {
  for (const battler of battlers) {
    if (!battler || (aliveOnly && battler.hp === 0)) continue;
    RESOURCES[resource].set(battler, targetValue(battler, resource, change));
  }
}
