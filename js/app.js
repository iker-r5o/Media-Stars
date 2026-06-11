// Media Stars - no-framework front-end JavaScript

const state = {
    items: [],
    currentFilter: 'all'
};

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
    /* connects elements to the DOM */
    elements.form = document.getElementById('add-form');
    elements.type = document.getElementById('type');
    elements.title = document.getElementById('title');
    elements.year = document.getElementById('year');
    elements.length = document.getElementById('length');
    elements.seasons = document.getElementById('seasons');
    elements.pages = document.getElementById('pages');
    elements.genre = document.getElementById('genre');
    elements.rating = document.getElementById('rating');
    elements.ratingOutput = document.getElementById('rating-output');
    elements.imageUrl = document.getElementById('image_url');
    elements.imageText = document.getElementById('image-text');
    elements.formError = document.getElementById('form-error');
    elements.catalog = document.getElementById('catalog');
    elements.emptyMsg = document.getElementById('empty-msg');
    elements.itemCount = document.getElementById('item-count');

    /* adds event listeners to some of the elements */
    elements.form.addEventListener('submit', handleAdd);
    elements.type.addEventListener('change', updateFormFields);
    elements.rating.addEventListener('input', () => {
        elements.ratingOutput.textContent = elements.rating.value;
    });

    document.querySelectorAll('.tab').forEach((tab) => {
        tab.addEventListener('click', handleTabClick);
    });

    updateFormFields();
    loadItems();
});

/* updates the form fields based on the type of media */
function updateFormFields() {
    /* set variables */
    const type = elements.type.value;
    const lengthLabel = document.getElementById('length-label');
    const seasonsLabel = document.getElementById('seasons-label');
    const pagesLabel = document.getElementById('pages-label');

    /* toggle hides the label if type is not movie, tv, or book */
    lengthLabel.classList.toggle('hidden', type !== 'movie');
    seasonsLabel.classList.toggle('hidden', type !== 'tv');
    pagesLabel.classList.toggle('hidden', type !== 'book');

    elements.imageText.textContent = type === 'book' ? 'Cover URL' : 'Poster URL';
}

/* makes the website accessible to keyboard users by setting up tab navigation */
function handleTabClick(event) {
    state.currentFilter = event.currentTarget.dataset.filter;

    document.querySelectorAll('.tab').forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.filter === state.currentFilter);
    });

    renderItems();
}

/* loads the items from the server */
async function loadItems() {
    try {
        const data = await apiRequest('php/list.php');
        state.items = Array.isArray(data) ? data : [];
        renderItems();
    } catch (error) {
        showCatalogError(error.message || 'Could not load items. Is PHP running?');
    }
}

/* handles the addition of new media */
async function handleAdd(event) {
    event.preventDefault();
    clearFormError();

    /* reads the form and validates the input */
    const newItem = readForm();
    const error = validateItem(newItem);

    if (error) {
        showFormError(error);
        return;
    }

    try {
        /* sends the new media to the server */
        const result = await apiRequest('php/add.php', {
            method: 'POST',
            body: JSON.stringify(newItem)
        });

        state.items.push(result.item);
        elements.form.reset();
        elements.rating.value = 3;
        elements.ratingOutput.textContent = '3';
        updateFormFields();
        renderItems();
    } catch (error) {
        /* shows an error message if it is returned */
        showFormError(error.message || 'Could not add item.');
    }
}

function readForm() {
    /* reads the form and validates the input */
    const type = elements.type.value;
    /* creates a new item object */
    const item = {
        type,
        title: elements.title.value.trim(),
        year: Number(elements.year.value),
        genre: elements.genre.value.trim(),
        rating: Number(elements.rating.value),
        image_url: elements.imageUrl.value.trim()
    };

    if (type === 'movie') {
        item.length = Number(elements.length.value);
    } else if (type === 'tv') {
        item.seasons = Number(elements.seasons.value);
    } else if (type === 'book') {
        item.pages = Number(elements.pages.value);
    }

    return item;
}

/* makes sure there are no errors with the item */
function validateItem(item) {
    if (!['movie', 'tv', 'book'].includes(item.type)) {
        return 'Please choose a valid type.';
    }

    if (item.title.length < 1 || item.title.length > 80) {
        return 'Please enter a title between 1 and 80 characters.';
    }

    if (!Number.isInteger(item.year) || item.year < 1000 || item.year > 2100) {
        return 'Please enter a valid year between 1000 and 2100.';
    }

    if (item.genre.length < 1 || item.genre.length > 40) {
        return 'Please enter a genre between 1 and 40 characters.';
    }

    if (!Number.isInteger(item.rating) || item.rating < 1 || item.rating > 5) {
        return 'Please choose a rating from 1 to 5.';
    }

    if (!isHttpUrl(item.image_url)) {
        return 'Image URL must start with http:// or https://.';
    }

    if (item.type === 'movie' && (!Number.isInteger(item.length) || item.length < 1 || item.length > 600)) {
        return 'Movie length must be between 1 and 600 minutes.';
    }

    if (item.type === 'tv' && (!Number.isInteger(item.seasons) || item.seasons < 1 || item.seasons > 100)) {
        return 'TV seasons must be between 1 and 100.';
    }

    if (item.type === 'book' && (!Number.isInteger(item.pages) || item.pages < 1 || item.pages > 10000)) {
        return 'Book pages must be between 1 and 10,000.';
    }

    return '';
}

/* makes sure the url is working */
function isHttpUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_error) {
        return false;
    }
}

//this has the current items
function renderItems() {
    //cleans everything and rerenders it first
    elements.catalog.replaceChildren();

    const filteredItems = state.items.filter((item) => {
        return state.currentFilter === 'all' || item.type === state.currentFilter;
    });

    elements.emptyMsg.classList.toggle('hidden', filteredItems.length > 0);
    elements.itemCount.textContent = `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'} shown`;

    filteredItems.forEach((item) => {
        elements.catalog.appendChild(makeCard(item));
    });
}

//this will make the card/icon for each added item
function makeCard(item) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = String(item.id);

    const posterWrap = document.createElement('div');
    posterWrap.className = 'poster-wrap';

    const image = document.createElement('img');
    image.src = item.image_url;
    image.alt = `${item.title} ${item.type === 'book' ? 'cover' : 'poster'}`;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
        image.remove();
        posterWrap.textContent = 'Image unavailable';
        posterWrap.classList.add('empty-msg');
    }, { once: true });
    posterWrap.appendChild(image);

    const body = document.createElement('div');
    body.className = 'card-body';

    body.appendChild(makeText('p', typeLabel(item.type), 'card-type'));
    body.appendChild(makeText('h3', item.title));
    body.appendChild(makeText('p', `${item.year} · ${item.genre}`, 'card-info'));
    body.appendChild(makeText('p', detailText(item), 'card-info'));

    const average = getAverageRating(item);
    body.appendChild(makeText('p', starString(average), 'stars'));
    body.appendChild(makeText('p', `Average: ${average.toFixed(1)} / 5 (${ratingCount(item)} rating${ratingCount(item) === 1 ? '' : 's'})`, 'rating-summary'));
    body.appendChild(makeRateForm(item));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Remove';
    deleteButton.addEventListener('click', () => deleteItem(item.id));
    body.appendChild(deleteButton);

    card.appendChild(posterWrap);
    card.appendChild(body);
    return card;
}

//this is what has the rating option for each piece of media
function makeRateForm(item) {
    const form = document.createElement('form');
    form.className = 'rate-form';

    const label = document.createElement('label');
    label.textContent = 'Leave a rating';

    const select = document.createElement('select');
    select.name = 'rating';

    for (let value = 1; value <= 5; value += 1) {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = String(value);
        if (value === 5) {
            option.selected = true;
        }
        select.appendChild(option);
    }

    label.appendChild(select);

    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'secondary-btn';
    button.textContent = 'Rate';

    form.appendChild(label);
    form.appendChild(button);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await rateItem(item.id, Number(select.value));
    });

    return form;
}

//this sends the rating to the databse
async function rateItem(id, rating) {
    try {
        const result = await apiRequest('php/rate.php', {
            method: 'POST',
            body: JSON.stringify({ id, rating })
        });

        state.items = state.items.map((item) => {
            return item.id === id ? result.item : item;
        });

        renderItems();
    } catch (error) {
        alert(error.message || 'Could not save rating.');
    }
}
//this will remove it from the library
async function deleteItem(id) {
    if (!confirm('Remove this item from your library?')) {
        return;
    }

    try {
        await apiRequest('php/delete.php', {
            method: 'POST',
            body: JSON.stringify({ id })
        });

        state.items = state.items.filter((item) => item.id !== id);
        renderItems();
    } catch (error) {
        alert(error.message || 'Could not delete item.');
    }
}
//this is what has the helper functions so we can interact with the backend
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    let data = null;

    try {
        data = await response.json();
    } catch (_error) {
        throw new Error('Server returned invalid JSON.');
    }

    if (!response.ok || data.ok === false) {
        throw new Error(data.error || 'Request failed.');
    }

    return data;
}

//the helper function to make the text
function makeText(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) {
        element.className = className;
    }
    return element;
}
//makes the label pretty :)
function typeLabel(type) {
    if (type === 'tv') {
        return 'TV Show';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function detailText(item) {
    if (item.type === 'movie') {
        return `${item.length} minutes`;
    }

    if (item.type === 'tv') {
        return `${item.seasons} season${item.seasons === 1 ? '' : 's'}`;
    }

    return `${item.pages} pages`;
}
//makes the avg rating 
function getAverageRating(item) {
    const ratings = Array.isArray(item.ratings) ? item.ratings : [];
    if (ratings.length === 0) {
        return 0;
    }

    const total = ratings.reduce((sum, rating) => sum + Number(rating), 0);
    return total / ratings.length;
}

function ratingCount(item) {
    return Array.isArray(item.ratings) ? item.ratings.length : 0;
}

function starString(average) {
    const rounded = Math.round(average);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function clearFormError() {
    elements.formError.textContent = '';
}

function showFormError(message) {
    elements.formError.textContent = message;
}

function showCatalogError(message) {
    elements.catalog.replaceChildren(makeText('p', message, 'error-msg'));
    elements.itemCount.textContent = 'Unable to load items';
}
