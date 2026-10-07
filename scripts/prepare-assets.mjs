import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';
const root=process.cwd();
async function files(dir){const out=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())out.push(...await files(p));else if(entry.name.endsWith('.md')&&!entry.name.startsWith('_'))out.push(p);}return out;}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const fontfile=path.join(root,'scripts/fonts/manrope-cyrillic.ttf');
const hebrewFont=path.join(root,'scripts/fonts/hebrew.ttf');
const serifFont=path.join(root,'node_modules/@fontsource/source-serif-4/files/source-serif-4-cyrillic-400-normal.woff');
const emblem=await sharp('public/images/menorah-emblem.svg').resize(56,60).png().toBuffer();
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
 const overlay=Buffer.from('<svg width="1200" height="630"><defs><linearGradient id="shade"><stop stop-color="#090a08" stop-opacity=".88"/><stop offset=".55" stop-color="#090a08" stop-opacity=".38"/><stop offset="1" stop-color="#090a08" stop-opacity=".08"/></linearGradient><linearGradient id="bottom" x2="0" y2="1"><stop offset=".65" stop-color="#090a08" stop-opacity="0"/><stop offset="1" stop-color="#090a08" stop-opacity=".9"/></linearGradient></defs><rect width="1200" height="630" fill="url(#shade)"/><rect width="1200" height="630" fill="url(#bottom)"/><path d="M60 536H1140" stroke="#c6a573" stroke-opacity=".4"/></svg>');
 let title, titleSize=118, titleInfo;
 do {
  title=await sharp({text:{text:`<span foreground="#f1ede5">${esc(d.title.toLocaleUpperCase('uk'))}</span>`,font:`Source Serif 4 ${titleSize}`,fontfile:serifFont,rgba:true}}).png().toBuffer();
  titleInfo=await sharp(title).metadata();
  titleSize-=4;
 } while(titleInfo.width>1080 && titleSize>=40);
 const heb=await sharp({text:{text:`<span foreground="#d9bb86">${esc(d.hebrew)}</span>`,font:'Noto Serif Hebrew 52',fontfile:hebrewFont,rgba:true}}).png().toBuffer();
 const brand=await sharp({text:{text:'<span foreground="#f1ede5">ЦИКЛ ТОРИ</span>',font:'Manrope 25',fontfile,rgba:true}}).png().toBuffer();
 const reading=await sharp({text:{text:`<span foreground="#d9bb86">${esc(d.reading)}</span>`,font:'Manrope 25',fontfile,rgba:true}}).png().toBuffer();
 const category=await sharp({text:{text:'<span foreground="#bbb5aa">Тижнева глава Тори</span>',font:'Manrope 22',fontfile,rgba:true}}).png().toBuffer();
 const categoryInfo=await sharp(category).metadata();
 await sharp(source).resize(1200,630,{fit:'cover'}).composite([{input:overlay},{input:emblem,left:56,top:42},{input:brand,left:128,top:62},{input:title,left:60,top:224},{input:heb,left:64,top:224+titleInfo.height+34},{input:reading,left:60,top:565},{input:category,left:1140-categoryInfo.width,top:567}]).jpeg({quality:92,chromaSubsampling:'4:4:4'}).toFile(path.join(path.dirname(image),'share-v2.jpg'));
}
const custom=process.env.SITE_URL;
if(custom)await fs.writeFile('public/CNAME',new URL(custom).hostname+'\n');
else await fs.rm('public/CNAME',{force:true});
await fs.writeFile('public/.nojekyll','');
console.log('Responsive covers and OpenGraph images prepared.');
