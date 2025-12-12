import fs from 'fs';
import path from 'path';
const dbPath = path.join(process.cwd(),'db.json');

export function loadDB(){
  return JSON.parse(fs.readFileSync(dbPath,'utf-8'));
}
export function saveDB(db){
  fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
}
