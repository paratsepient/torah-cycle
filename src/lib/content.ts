import { getCollection, type CollectionEntry } from 'astro:content';
import { selectCurrent } from './calendar.mjs';
export type Parasha = CollectionEntry<'parashot'>;
export const books = [
 {title:'Берешит', hebrew:'בראשית', count:12}, {title:'Шмот', hebrew:'שמות', count:11},
 {title:'Ваїкра', hebrew:'ויקרא', count:10}, {title:'Бемідбар', hebrew:'במדבר', count:10},
 {title:'Дварім', hebrew:'דברים', count:11},
];
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/,'')}/${path.replace(/^\//,'')}`;
export async function allPublished() {
 const all = await getCollection('parashot', e => e.data.published && !e.data.draft);
 const keys = new Set<string>();
 for (const e of all) {
 const key = `${e.data.cycleYear}/${e.data.slug}`;
 if(keys.has(key)) throw new Error(`Повторний slug: ${key}`); keys.add(key);
 }
 return all.sort((a,b)=>a.data.cycleYear-b.data.cycleYear || a.data.bookOrder-b.data.bookOrder || a.data.parashaOrder-b.data.parashaOrder);
}
export function latestYear(all: Parasha[]) { return Math.max(...all.map(e=>e.data.cycleYear)); }
export function articleUrl(entry: Parasha, all: Parasha[]) {
 return url(entry.data.cycleYear === latestYear(all) ? `parasha/${entry.data.slug}/` : `cycle/${entry.data.cycleYear}/parasha/${entry.data.slug}/`);
}
export function current(all: Parasha[]): Parasha | undefined { return selectCurrent(all); }
export function formattedDate(date: string) { return new Intl.DateTimeFormat('uk-UA',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Kyiv'}).format(new Date(date+'T12:00:00Z')).replace(' р.',''); }
