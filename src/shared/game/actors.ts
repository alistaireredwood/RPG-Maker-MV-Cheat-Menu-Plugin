type Named = { name?: string } | null | undefined;
type Created = { name(): string } | null | undefined;

// the in-game name wins over the database one: events can rename actors
export function listedActorIds(
  dataActors: readonly Named[],
  created: readonly Created[],
): number[] {
  const ids: number[] = [];
  const end = Math.max(dataActors.length, created.length);
  for (let id = 1; id < end; id++) {
    if (!dataActors[id]) continue;
    const name = created[id]?.name() ?? dataActors[id]?.name ?? '';
    if (name.trim()) ids.push(id);
  }
  return ids;
}

// a saved id can point at an unlisted actor (v1 save, another game)
export const resolveActorId = (
  current: number,
  ids: readonly number[],
): number | null => (ids.includes(current) ? current : (ids[0] ?? null));

export function stepActorId(
  current: number,
  ids: readonly number[],
  step: 1 | -1,
): number | null {
  if (ids.length === 0) return null;
  const at = ids.indexOf(current);
  if (at === -1) return ids[0];
  return ids[(at + step + ids.length) % ids.length];
}
