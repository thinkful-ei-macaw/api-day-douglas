const BASE_URL = 'https://thinkful-list-api.herokuapp.com/douglas-malcolm';

const getItems = function() {
  return fetch(BASE_URL + '/items');
};

const createItem = function (name) {
  return fetch(`${BASE_URL}/items`, {method:'POST', headers: {'Content-Type': 'application/json'},body: JSON.stringify({name})});
};

const updateItem = function (id, updateData) {
  return fetch(`${BASE_URL}/items/${id}`, {method:'PATCH', headers: {'Content-Type': 'application/json'},body: JSON.stringify(updateData)});
};

const deleteItem = function(id) {
  return fetch(`${BASE_URL}/items/${id}`, {method: 'DELETE'});
};
export default {
  getItems,
  createItem,
  updateItem,
  deleteItem
};