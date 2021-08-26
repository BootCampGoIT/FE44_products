import axios from 'axios';
import { data } from './data';
import { refs } from './refs';

// const baseURL = 'https://fe44-af81a-default-rtdb.firebaseio.com';
console.dir(process.env.BASE_URL);

const getMarkup = arr => {
  const markup = arr.reduce((acc, item) => {
    acc += `
    <li>
    <h3>${item.name}</h3>
    <p>${item.price}</p>
    <button type="button" id=${item.id} data-button="deleteButton" data-category=${item.category}>Delete</button>
    <button type="button" id=${item.id} data-button="editButton" data-category=${item.category}>Edit</button>
    </li>

    `;
    return acc;
  }, '');
  refs.productList.innerHTML = markup;
};

const getAction = e => {
  if (e.target.nodeName !== 'BUTTON') return;
  const action = e.target.dataset.button;
  switch (action) {
    case 'deleteButton':
      deleteProduct(e);
    case 'editButton':
      console.log('e.target :>> ', e.target);
      const product = data.tools.find(item => item.id === e.target.id);

      refs.productEditForm.elements.name.value = product.name;
      refs.productEditForm.elements.price.value = product.price;

      const patchProduct = e => {
        e.preventDefault();
        const {
          name: { value: name },
          price: { value: price },
        } = refs.productEditForm.elements;
        const editedProduct = { name, price };
        axios
          .patch(process.env.BASE_URL + `/products/${product.category}/${product.id}.json`, editedProduct)
          .then(() => {
            data.tools = [
              ...data.tools.map(item => (item.id === product.id ? { ...item, name, price } : item)),
            ];
            getMarkup(data.tools);
            refs.productEditForm.removeEventListener('submit', patchProduct);
          });
      };
      refs.productEditForm.addEventListener('submit', patchProduct);

    default:
      return;
  }
};

const deleteProduct = e => {
  axios
    .delete(process.env.BASE_URL + `/products/${e.target.dataset.category}/${e.target.id}.json`)
    .then(() => (data.tools = data.tools.filter(item => item.id !== e.target.id)))
    .then(() => getMarkup(data.tools));
};

axios.get(process.env.BASE_URL + `/products/tools.json`).then(response => {
  if (response.data) {
    const keys = Object.keys(response.data);
    const result = keys.map(key => ({ ...response.data[key], id: key }));
    data.tools = result;
    getMarkup(result);
    refs.productList.addEventListener('click', getAction);
  }
});

const onHandleSubmit = e => {
  e.preventDefault();
  const {
    name: { value: name },
    price: { value: price },
    category: { value: category },
  } = refs.productForm.elements;
  axios
    .post(process.env.BASE_URL + `/products/${category}.json`, {
      name,
      price,
      category,
    })
    .then(response => {
      data.tools = [...data.tools, { id: response.data.name, name, price, category }];
    })
    .then(() => getMarkup(data.tools))
    .catch(err => console.dir(err));
  e.target.reset();
};

refs.productForm.addEventListener('submit', onHandleSubmit);
