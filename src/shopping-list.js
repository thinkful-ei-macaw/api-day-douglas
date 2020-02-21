import $ from 'jquery';
import api from './api';
import store from './store';

const generateItemElement = function (item) {
  let itemTitle = `<span class="shopping-item shopping-item__checked">${item.name}</span>`;
  if (!item.checked) {
    itemTitle = `
      <form class="js-edit-item">
        <input class="shopping-item" type="text" value="${item.name}" />
      </form>
    `;
  }

  return `
    <li class="js-item-element" data-item-id="${item.id}">
      ${itemTitle}
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
          <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
          <span class="button-label">delete</span>
        </button>
      </div>
    </li>`;
};

const generateShoppingItemsString = function (shoppingList) {
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join('');
};

const generateError = function(error){
  if (error.message) {
    return `
    <p>${error.message}</p>
    `;
  } else {
    return '';
  }
};

const resetError = function() {
  store.error.message = null;
  store.error.code = null;
};

const render = function () {
  // Filter item list if store prop is true by item.checked === false
  let items = [...store.items];
  if (store.hideCheckedItems) {
    items = items.filter(item => !item.checked);
  }
  const errorString = generateError(store.error);
  // render the shopping list in the DOM
  const shoppingListItemsString = generateShoppingItemsString(items);
  // insert that HTML into the DOM
  $('.js-shopping-list').html(errorString + shoppingListItemsString);
  resetError();
};

const handleNewItemSubmit = function () {
  $('#js-shopping-list-form').submit(function (event) {
    event.preventDefault();
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    api.createItem(newItemName)
      .then(res => {
        if (!res.ok){
          store.error.code = res.status;
        }
        return res.json();
      })
      .then((newItem) => {
        if (store.error.code) {
          store.error.message= newItem.message;
          return Promise.reject(store.error);
        } else {
          store.addItem(newItem);
          render();
        }
      })
      .catch(err => {
        store.error.message = err.message;
        render();
      });
  });
};

const getItemIdFromElement = function (item) {
  return $(item)
    .closest('.js-item-element')
    .data('item-id');
};

const handleDeleteItemClicked = function () {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in store.items
    const id = getItemIdFromElement(event.currentTarget);
    // delete the item
    api.deleteItem(id)
      .then((res)=> {
        if (!res.ok){
          store.error.code = res.status;
          return res.json();
        } else {
          store.findAndDelete(id);
          render();
        }
      })
      .then(data => {
        if (store.error.code){
          store.error.message = data.message;
          return Promise.reject(store.error);
        }})
      .catch(err => {
        store.error.message = err.message;
        render();
      });
  });
};

const handleEditShoppingItemSubmit = function () {
  $('.js-shopping-list').on('submit', '.js-edit-item', event => {
    event.preventDefault();
    const id = getItemIdFromElement(event.currentTarget);
    const itemName = $(event.currentTarget).find('.shopping-item').val();
    const updated = {name: itemName};
    api.updateItem(id, updated)
      .then((res)=> {
        if (!res.ok){
          store.error.code = res.status;
          return res.json();
        } else {
          store.findAndUpdate(id, updated);
          render();
        }
      })
      .then(data => {
        if (store.error.code){
          store.error.message = data.message;
          return Promise.reject(store.error);
        }})
      .catch(err => {
        store.error.message = err.message;
        render();
      });
  });
};

const handleItemCheckClicked = function () {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    const id = getItemIdFromElement(event.currentTarget);
    const obj = store.findById(id);
    const updated = {checked: !obj.checked};
    api.updateItem(id, updated)
      .then(() => {
        store.findAndUpdate(id, updated);
        render();
      })
      .catch(err => {
        store.error.message = err.message;
        render();
      });
  });
};

const handleToggleFilterClick = function () {
  $('.js-filter-checked').click(() => {
    store.toggleCheckedFilter();
    render();
  });
};

const bindEventListeners = function () {
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleEditShoppingItemSubmit();
  handleToggleFilterClick();
};
// This object contains the only exposed methods from this module:
export default {
  render,
  bindEventListeners
};