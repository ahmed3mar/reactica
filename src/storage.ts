import Cookies from 'universal-cookie';
const cookies = new Cookies();

export const storage = {
  set: <Item>(key: string, value: Item): void => cookies.set(key, value, { path: '/' }),
  get: <Item>(key: string): Item => cookies.get(key),
  all: <Item>(): Item[] => cookies.getAll(),
  remove: (key: string): void => cookies.remove(key),
}