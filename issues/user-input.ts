/* 
  Found no problems here. Tested with an express server (app.ts -file) and everything worked
  One change you could make though is not passing the whole http post parameter object to these functions
*/

export interface VerySimpleDatabase {
  insert(key: string, value: string | number): void;
}

export function savePassword(
  database: VerySimpleDatabase,
  httpPostParams: Record<string, string>
) {
  database.insert('password', httpPostParams.password);
}

export function saveAge(
  database: VerySimpleDatabase,
  httpPostParams: Record<string, string>
) {
  database.insert('age', parseInt(httpPostParams.age));
}
