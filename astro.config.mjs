import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
const repo = process.env.GITHUB_REPOSITORY;
const custom = process.env.SITE_URL;
const owner = repo?.split('/')[0];
const name = repo?.split('/')[1];
export default defineConfig({
 site: custom || (owner ? `https://${owner}.github.io` : 'https://example.com'),
 base: process.env.SITE_BASE || (custom ? '/' : (name && name !== `${owner}.github.io` ? `/${name}` : '/')),
 output: 'static', trailingSlash: 'always', integrations: [sitemap()],
});
