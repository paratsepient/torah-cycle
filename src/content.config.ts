import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
 const d = new Date(v + 'T12:00:00Z'); return !Number.isNaN(+d) && d.toISOString().slice(0,10) === v;
}, 'Очікується справжня дата YYYY-MM-DD');
const parashot = defineCollection({
 loader: glob({ pattern: '**/[^_]*.md', base: './src/content/parashot' }),
 schema: z.object({
 title: z.string().min(1), hebrew: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
 cycleYear: z.number().int().min(5700), book: z.string(), bookHebrew: z.string(),
 bookOrder: z.number().int().min(1).max(5), parashaOrder: z.number().int().min(1).max(12),
 reading: z.string(), readingUrl: z.url(), gregorianDate: isoDate, hebrewDate: z.string(),
 activeFrom: isoDate.optional(), heroImage: z.string().regex(/^\/images\/.+\.webp$/), heroAlt: z.string().min(1),
 essence: z.string().min(1), shareDescription: z.string().min(1).max(180).optional(), reflectionQuestions: z.array(z.string()).min(1).max(3),
 published: z.boolean().default(false), draft: z.boolean().default(false),
 }).refine(d => d.heroImage === `/images/parashot/${d.cycleYear}/${d.slug}/cover.webp`, {
  message: 'heroImage має відповідати /images/parashot/YEAR/SLUG/cover.webp', path: ['heroImage']
 })
});
export const collections = { parashot };
