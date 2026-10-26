/** Casual, personalized greeting based on the current hour. */
export function personalizedGreeting(name: string, date = new Date()) {
  const hour = date.getHours();
  const firstName = name.trim().split(/\s+/)[0] || name;

  if (hour < 5) return `Night owl, ${firstName}`;
  if (hour < 12) return `Mornin' ${firstName}`;
  if (hour < 17) return `Afternoon, ${firstName}`;
  if (hour < 21) return `Evenin' ${firstName}`;
  return `Night, ${firstName}`;
}
