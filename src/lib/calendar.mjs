export function kyivToday(now = new Date()) {
 return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Kyiv', year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
}
export function weekStart(date) {
 const d = new Date(date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate()-6); return d.toISOString().slice(0,10);
}
export function selectCurrent(entries, today = kyivToday()) {
 const sorted = entries.filter(e => e.data.published && !e.data.draft).toSorted((a,b) => a.data.gregorianDate.localeCompare(b.data.gregorianDate));
 if (!sorted.length) return undefined;
 const active = sorted.filter(e => (e.data.activeFrom || weekStart(e.data.gregorianDate)) <= today && today <= e.data.gregorianDate);
 if (active.length) return active.at(-1);
 return sorted.filter(e => e.data.gregorianDate < today).at(-1) || sorted[0];
}
