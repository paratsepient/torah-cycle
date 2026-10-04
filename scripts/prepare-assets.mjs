import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';
const root=process.cwd();
async function files(dir){const out=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())out.push(...await files(p));else if(entry.name.endsWith('.md')&&!entry.name.startsWith('_'))out.push(p);}return out;}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const fontfile=path.join(root,'scripts/fonts/manrope-cyrillic.ttf');
const hebrewFont=path.join(root,'scripts/fonts/hebrew.ttf');
for(const file of await files('src/content/parashot')){
 const raw=await fs.readFile(file,'utf8');const front=raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
 if(!front)throw new Error(`Frontmatter відсутній: ${file}`);
 const d=YAML.parse(front[1]);if(!d.published||d.draft)continue;
 if(!d.heroImage?.match(/^\/images\/.+\.webp$/))throw new Error(`Неправильний шлях зображення: ${file}`);
 if(new Date(d.gregorianDate+'T12:00:00Z').getUTCDay()!==6 && !d.slug.includes('vezot'))throw new Error(`Дата читання має бути шабатом: ${file}`);
 if(d.activeFrom&&d.activeFrom>d.gregorianDate)throw new Error(`activeFrom пізніше читання: ${file}`);
 const image=path.resolve(root,'public'+d.heroImage);
 if(!image.startsWith(path.join(root,'public/images/')))throw new Error('Шлях зображення поза public/images');
 try{await fs.access(image);}catch{throw new Error(`Додайте heroImage: ${image}`);}
 const source=await fs.readFile(image);
 for(const width of [640,960])await sharp(source).resize({width}).webp({quality:80}).toFile(image.replace(/cover\.webp$/,`cover-${width}.webp`));
 const overlay=Buffer.from('<svg width="1200" height="630"><defs><linearGradient id="g"><stop stop-color="#090a08" stop-opacity=".9"/><stop offset="1" stop-color="#090a08" stop-opacity=".25"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><path d="M64 80 76 92 64 104 52 92Z" fill="none" stroke="#c6a573" stroke-width="2"/><path d="M56 553H1144" stroke="#c6a573" stroke-opacity=".5"/></svg>');
 const title=await sharp({text:{text:`<span foreground="#f1ede5">${esc(d.title)}</span>`,font:'Manrope 96',fontfile,width:1040,rgba:true}}).png().toBuffer();
 const heb=await sharp({text:{text:`<span foreground="#c6a573">${esc(d.hebrew)}</span>`,font:'Noto Serif Hebrew 56',fontfile:hebrewFont,width:1000,rgba:true}}).png().toBuffer();
 const brand=await sharp({text:{text:'<span foreground="#d4c4ab">ЦИКЛ ТОРИ</span>',font:'Manrope 22',fontfile,rgba:true}}).png().toBuffer();
 const date=await sharp({text:{text:`<span foreground="#d4c4ab">${esc(d.reading)} · ${d.cycleYear}</span>`,font:'Manrope 22',fontfile,rgba:true}}).png().toBuffer();
 await sharp(source).resize(1200,630,{fit:'cover'}).composite([{input:overlay},{input:brand,left:96,top:80},{input:title,left:56,top:245},{input:heb,left:60,top:385},{input:date,left:56,top:570}]).jpeg({quality:85}).toFile(path.join(path.dirname(image),'og.jpg'));
}
const custom=process.env.SITE_URL;
if(custom)await fs.writeFile('public/CNAME',new URL(custom).hostname+'\n');
else await fs.rm('public/CNAME',{force:true});
await fs.writeFile('public/.nojekyll','');
console.log('Responsive covers and OpenGraph images prepared.');
