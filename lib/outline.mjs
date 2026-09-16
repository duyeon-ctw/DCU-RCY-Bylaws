// Group the existing heading hierarchy without inventing document chapters.
export function displayHeadingTitle(title) {
  return title.replace(/^(제\s*\d+조(?:의\s*\d+)?)\s*[（(]([\s\S]*)[）)]\s*$/, '$1 $2').trim();
}
export function groupOutline(entries) {
  if (!entries.length) return [];
  const chapter = title => /^제\s*\d+\s*장(?:\s|$)/.test(title);
  const supplement = title => /^(부칙|별표|별지|부록)(?:\s|$)/.test(title);
  const hasChapters = entries.some(entry => chapter(entry.title));
  const topLevel = Math.min(...entries.map(entry => entry.level));
  const groups = [];
  let current = null;
  for (const entry of entries) {
    const item = { ...entry, title: displayHeadingTitle(entry.title) };
    const startsGroup = hasChapters
      ? chapter(item.title) || supplement(item.title)
      : item.level === topLevel;
    if (startsGroup) {
      current = { ...item, children: [] };
      groups.push(current);
    } else if (current) current.children.push(item);
    else groups.push({ ...item, children: [] });
  }
  return groups;
}
