import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate } from '../js/schema.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const forbidden=/token|apikey|password|secret|authorization|cookie|email|phone|accountid|userid|workoutid|oauth|credential|username|realname|fullname|address|location|gymname|appleid|deviceid|machineid|rawresponse|rawlyfta|headers/i;
export function securityKeys(value,path='data'){
  const errors=[];
  if(value&&typeof value==='object')for(const [key,child]of Object.entries(value)){
    if(forbidden.test(key.replace(/[_-]/g,'')))errors.push(`${path}.${key}: forbidden metadata key`);
    errors.push(...securityKeys(child,`${path}.${key}`));
  }
  return errors;
}
async function run(){
  let errors=[];
  const files=(await readdir(resolve(root,'data'))).filter(f=>f.endsWith('.json'));
  for(const required of ['latest.json','history.json','demo.json'])if(!files.includes(required))errors.push(`${required}: missing required file`);
  for(const file of files){
    try{const value=JSON.parse(await readFile(resolve(root,'data',file),'utf8'));const kind=file.slice(0,-5);errors.push(...securityKeys(value,file),...validate(kind,value,true).map(e=>file+': '+e));}
    catch(error){errors.push(`${file}: ${error.message}`);}
  }
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('GainMap: all data files are valid; no forbidden metadata keys.');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await run();
