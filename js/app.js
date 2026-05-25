// Media Stars - main javascript file

var allItems = [];
var currentFilter = 'all';

// when page loads, get items from server
document.addEventListener('DOMContentLoaded', function () {
    loadItems();

    document.getElementById('add-form').addEventListener('submit', handleAdd);
    document.getElementById('type').addEventListener('change', updateFormFields);

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', handleTabClick);
    }

    updateFormFields();
});

function updateFormFields() {
    var type = document.getElementById('type').value;
    var lengthLabel = document.getElementById('length-label');
    var seasonsLabel = document.getElementById('seasons-label');
    if (type === 'tv') {
        lengthLabel.classList.add('hidden');
        seasonsLabel.classList.remove('hidden');
        document.getElementById('poster-text').textContent = 'Poster URL';
    } else if (type === 'song') {
        lengthLabel.classList.remove('hidden');
        seasonsLabel.classList.add('hidden');
        document.getElementById('length-text').textContent = 'Length (minutes)';
        document.getElementById('poster-text').textContent = 'Album art URL';
    } else {
        lengthLabel.classList.remove('hidden');
        seasonsLabel.classList.add('hidden');
        document.getElementById('length-text').textContent = 'Length (minutes)';
        document.getElementById('poster-text').textContent = 'Poster URL';
    }
}

function handleTabClick(e) {
    currentFilter = e.target.getAttribute('data-filter');

    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    e.target.classList.add('active');

    showItems();
}

function loadItems() {
    fetch('php/list.php')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            allItems = data;
            showItems();
        })
        .catch(function () {
            document.getElementById('catalog').innerHTML = '<p class="error-msg">Could not load items. Is PHP running?</p>';
        });
}

function showItems() {
    var catalog = document.getElementById('catalog');
    var emptyMsg = document.getElementById('empty-msg');
    catalog.innerHTML = '';

    var toShow = [];
    for (var i = 0; i < allItems.length; i++) {
        if (currentFilter === 'all' || allItems[i].type === currentFilter) {
            toShow.push(allItems[i]);
        }
    }

    if (toShow.length === 0) {
        emptyMsg.classList.remove('hidden');
        return;
    }

    emptyMsg.classList.add('hidden');

    for (var j = 0; j < toShow.length; j++) {
        catalog.appendChild(makeCard(toShow[j]));
    }
}

function makeCard(item) {
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', item.id);

    var typeName = item.type;
    if (typeName === 'tv') {
        typeName = 'TV Show';
    } else if (typeName === 'song') {
        typeName = 'Song';
    } else {
        typeName = 'Movie';
    }

    var extraInfo = '';
    if (item.type === 'movie' || item.type === 'song') {
        extraInfo = '<p class="card-info">' + item.length + ' min</p>';
    }
    if (item.type === 'tv') {
        extraInfo = '<p class="card-info">' + item.seasons + ' seasons</p>';
    }

    var stars = '';
    for (var s = 0; s < item.rating; s++) {
        stars = stars + '★';
    }
    for (var e = item.rating; e < 5; e++) {
        stars = stars + '☆';
    }

    card.innerHTML =
        '<img src="' + item.poster + '" alt="' + item.title + '">' +
        '<div class="card-body">' +
        '<p class="card-type">' + typeName + '</p>' +
        '<h3>' + item.title + '</h3>' +
        '<p class="card-info">' + item.year + ' · ' + item.genre + '</p>' +
        extraInfo +
        '<p class="stars">' + stars + '</p>' +
        '<button type="button" class="delete-btn">Remove</button>' +
        '</div>';

    card.querySelector('.delete-btn').addEventListener('click', function () {
        deleteItem(item.id);
    });

    return card;
}

function validateForm() {
    var errorBox = document.getElementById('form-error');
    errorBox.textContent = '';

    var type = document.getElementById('type').value;
    var title = document.getElementById('title').value.trim();
    var year = document.getElementById('year').value;
    var genre = document.getElementById('genre').value.trim();
    var rating = document.getElementById('rating').value;
    var poster = document.getElementById('poster').value.trim();

    if (title === '') {
        errorBox.textContent = 'Please enter a title.';
        return false;
    }

    if (year === '' || year < 1900 || year > 2100) {
        errorBox.textContent = 'Please enter a valid year (1900-2100).';
        return false;
    }

    if (genre === '') {
        errorBox.textContent = 'Please enter a genre.';
        return false;
    }

    if (poster === '') {
        errorBox.textContent = 'Please enter an image URL.';
        return false;
    }

    if (!poster.startsWith('http://') && !poster.startsWith('https://')) {
        errorBox.textContent = 'Image URL should start with http:// or https://';
        return false;
    }

    if (type === 'movie' || type === 'song') {
        var length = document.getElementById('length').value;
        if (length === '' || length < 1) {
            errorBox.textContent = 'Please enter length in minutes (at least 1).';
            return false;
        }
    }

    if (type === 'tv') {
        var seasons = document.getElementById('seasons').value;
        if (seasons === '' || seasons < 1) {
            errorBox.textContent = 'Please enter number of seasons (at least 1).';
            return false;
        }
    }

    return true;
}

function handleAdd(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    var type = document.getElementById('type').value;

    var newItem = {
        type: type,
        title: document.getElementById('title').value.trim(),
        year: parseInt(document.getElementById('year').value, 10),
        genre: document.getElementById('genre').value.trim(),
        rating: parseInt(document.getElementById('rating').value, 10),
        poster: document.getElementById('poster').value.trim()
    };

    if (type === 'movie' || type === 'song') {
        newItem.length = parseInt(document.getElementById('length').value, 10);
    }

    if (type === 'tv') {
        newItem.seasons = parseInt(document.getElementById('seasons').value, 10);
    }

    fetch('php/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            if (result.ok) {
                allItems.push(result.item);
                showItems();
                document.getElementById('add-form').reset();
                document.getElementById('form-error').textContent = '';
                updateFormFields();
            } else {
                document.getElementById('form-error').textContent = result.error || 'Could not add item.';
            }
        })
        .catch(function () {
            document.getElementById('form-error').textContent = 'Server error. Is PHP running?';
        });
}

function deleteItem(id) {
    if (!confirm('Remove this item from your library?')) {
        return;
    }

    fetch('php/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            if (result.ok) {
                var updated = [];
                for (var i = 0; i < allItems.length; i++) {
                    if (allItems[i].id !== id) {
                        updated.push(allItems[i]);
                    }
                }
                allItems = updated;
                showItems();
            } else {
                alert(result.error || 'Could not delete.');
            }
        })
        .catch(function () {
            alert('Server error. Is PHP running?');
        });
}
