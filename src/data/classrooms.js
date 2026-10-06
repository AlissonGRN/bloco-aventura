const definitions = [
  [1, ['A', 'B', 'C']],
  [2, ['A', 'B']],
  [3, ['A', 'C']],
  [4, ['A', 'B', 'C']],
  [5, ['A', 'B', 'C']],
];
export const CLASS_OPTIONS = Object.freeze(definitions.flatMap(([grade, sections]) => sections.map(section => ({
  key: `${grade}-${section.toLowerCase()}`,
  grade,
  section,
  name: `${grade}º ano ${section}`,
}))));
export const localClasses = () => CLASS_OPTIONS.map(c => ({ ...c, id: `class-${c.key}`, archived: false }));
export const classesForRoom = roomId => CLASS_OPTIONS.map(c => ({
  ...c,
  id: `${roomId}:${c.key}`,
  classroomId: roomId,
  archived: false,
}));
