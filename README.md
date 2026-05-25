# Media Stars

A simple media library for movies, TV shows, and songs. Built with HTML, CSS, JavaScript, and PHP.

## How to run

You need PHP installed. From this folder, start a local server:

```
php -S localhost:8000
```

Then open your browser to:

```
http://localhost:8000
```

Do not open `index.html` as a file in the browser — the PHP parts will not work that way.

## What it does

- View movies, TV shows, and songs (with example data already loaded)
- Filter by type using the tabs
- Add new items with form validation
- Remove items (with a confirm popup)
- Data is saved in `data/media.json` so it stays after you refresh
