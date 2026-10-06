import { getCollection, type CollectionEntry } from 'astro:content';
import { selectCurrent } from './calendar.mjs';
export type Parasha = CollectionEntry<'parashot'>;
export const books = [
 {title:'Берешит', hebrew:'בראשית', parashot:['Берешит','Ноах','Лех-Леха','Ваєра','Хаєй-Сара','Толдот','Ваєце','Ваїшлах','Ваєшев','Мікец','Ваїгаш','Ваїхі']},
 {title:'Шмот', hebrew:'שמות', parashot:['Шмот','Ваера','Бо','Бешалах','Їтро','Мішпатім','Трума','Тецаве','Кі Тіса','Ваякгель','Пкудей']},
 {title:'Ваїкра', hebrew:'ויקרא', parashot:['Ваїкра','Цав','Шміні','Тазріа','Мецора','Ахарей Мот','Кдошим','Емор','Бегар','Бехукотай']},
 {title:'Бемідбар', hebrew:'במדבר', parashot:['Бемідбар','Насо','Беаалотха','Шелах','Корах','Хукат','Балак','Пінхас','Матот','Масей']},
 {title:'Дварім', hebrew:'דברים', parashot:['Дварім','Ва-етханан','Екев','Реє','Шофтім','Кі Теце','Кі Таво','Ніцавім','Ваєлех','Гаазіну','Везот Габраха']},
];
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/,'')}/${path.replace(/^\//,'')}`;
export async function allPublished() {
 const all = await getCollection('parashot', e => !e.data.draft);
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
export function current(all: Parasha[]): Parasha | undefined { return selectCurrent(all.filter(e=>e.data.published)); }
export function formattedDate(date: string) { return new Intl.DateTimeFormat('uk-UA',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Kyiv'}).format(new Date(date+'T12:00:00Z')).replace(' р.',''); }
