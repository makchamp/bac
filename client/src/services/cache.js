
const keys = {
  gameSettings: 'gameSettings',
  categories: 'categories',
  user: 'user',
  ratings: 'ratings'
}

const putObject = (key, object) => {
  localStorage.setItem(key, JSON.stringify(object));
}

const removeObject = (key) => {
  localStorage.removeItem(key);
}

const fetchObject = (key) => {
  return JSON.parse(localStorage.getItem(key));
}

export {
  keys,
  putObject,
  fetchObject,
  removeObject,
}