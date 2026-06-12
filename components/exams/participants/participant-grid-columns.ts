export interface ParticipantGridOptions {
  showGroup: boolean;
  isDescriptiveGrading: boolean;
  showActions: boolean;
}

/** Student+contact merged; no separate contact column */
export function participantGridColumns(options: ParticipantGridOptions): string {
  const cols = ["minmax(140px, 1.8fr)"];
  if (options.showGroup) cols.push("minmax(120px, 1.1fr)");
  cols.push("minmax(56px, 72px)");
  if (options.isDescriptiveGrading) cols.push("minmax(64px, 80px)");
  cols.push("minmax(88px, 96px)", "minmax(88px, 110px)");
  if (options.showActions) cols.push("36px");
  return cols.join(" ");
}

/** Minimum inner width before horizontal scroll kicks in */
export function participantTableMinWidth(options: ParticipantGridOptions): number {
  let w = 140 + 72 + 96 + 110 + 32;
  if (options.showGroup) w += 120;
  if (options.isDescriptiveGrading) w += 64;
  if (options.showActions) w += 36;
  w += 5 * 12;
  return w;
}

export function participantGridOptionsFromProps(props: {
  showGroup?: boolean;
  isDescriptiveGrading: boolean;
  canManageParticipants?: boolean;
  onRemoveParticipant?: unknown;
}): ParticipantGridOptions {
  return {
    showGroup: props.showGroup ?? true,
    isDescriptiveGrading: props.isDescriptiveGrading,
    showActions: Boolean(props.canManageParticipants && props.onRemoveParticipant),
  };
}
