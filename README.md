# Media Stars

A no-framework media library built with HTML, CSS, JavaScript, and PHP. Data is stored in a JSON file at `data/media.json`.

## Features

- Browse movies, TV shows, and books
- Filter the catalog by category
- Add a new media item with client-side and server-side validation
- Use a rating slider when adding an item
- Leave additional ratings on existing items
- Display the average rating for each item
- Remove items from the library
- Save data through PHP endpoints using the file system

## Project structure

```text
media-stars-improved/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── php/
│   ├── add.php
│   ├── delete.php
│   ├── helpers.php
│   ├── list.php
│   └── rate.php
└── data/
    └── media.json
```

## How to run

You need PHP installed. From inside this folder, run:

```bash
php -S localhost:8000
```

Then open:

```text
http://localhost:8000
```

Do not open `index.html` directly as a file, because the PHP endpoints will not run that way.

## PHP endpoints

- `GET php/list.php` returns all saved media items.
- `POST php/add.php` adds a new media item.
- `POST php/rate.php` adds one rating to an item.
- `POST php/delete.php` removes an item by ID.

## Notes

This version intentionally does not use frameworks. It keeps the backend in PHP and stores data in the file system, which matches the project constraints.
