(function () {
    'use strict';

    var cache = {};

    function startOnlineScanner() {
        if (!document.getElementById('lampa-online-scanner-css')) {
            var css = `
                .lampa-scanner-block {
                    background: var(--background, rgba(30, 30, 35, 0.75));
                    border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
                    border-radius: 12px;
                    padding: 14px 16px;
                    margin: 12px 0;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    max-width: 700px;
                }
                .lampa-scanner__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 0.95em;
                }
                .lampa-scanner__title {
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: 0.3px;
                }
                .lampa-scanner__status {
                    font-size: 0.78em;
                    color: #aaaaaa;
                    background: rgba(255, 255, 255, 0.08);
                    padding: 2px 8px;
                    border-radius: 6px;
                }
                .lampa-scanner__grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 8px 14px;
                }
                .lampa-scanner__item {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .lampa-scanner__line {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.82em;
                    color: #cccccc;
                }
                .lampa-scanner__val {
                    font-weight: 600;
                    color: #ffffff;
                }
                .lampa-scanner__bar {
                    height: 5px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .lampa-scanner__fill {
                    height: 100%;
                    border-radius: 4px;
                    background: #e50914;
                    transition: width 0.5s ease;
                }
                .lampa-scanner__summary {
                    margin-top: 10px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    font-size: 0.85em;
                    color: #bbbbbb;
                    line-height: 1.35;
                }
            `;
            var style = document.createElement('style');
            style.id = 'lampa-online-scanner-css';
            style.innerHTML = css;
            document.head.appendChild(style);
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var movie = e.data.movie;
                if (!movie) return;

                var render = e.object.activity.render();
                if (render.find('.lampa-scanner-block').length) return;

                var box = $(
                    '<div class="lampa-scanner-block">' +
                        '<div class="lampa-scanner__header">' +
                            '<span class="lampa-scanner__title">Аналіз контенту</span>' +
                            '<span class="lampa-scanner__status" id="scanner-state">Завантаження...</span>' +
                        '</div>' +
                        '<div class="lampa-scanner__body">' +
                            '<div style="font-size: 0.85em; color: #888; padding: 4px 0;">Отримання даних фільму...</div>' +
                        '</div>' +
                    '</div>'
                );

                var target = render.find('.full-descr');
                if (target.length) {
                    target.before(box);
                } else {
                    render.find('.full-start-new__buttons, .full-start__buttons').after(box);
                }

                var title = movie.title || movie.name || '';
                var origTitle = movie.original_title || movie.original_name || '';
                var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                var overview = movie.overview || '';
                var genres = (movie.genres || []).map(function (g) { return g.name; }).join(', ');

                var rawKeywords = [];
                if (e.data.keywords) {
                    rawKeywords = e.data.keywords.keywords || e.data.keywords.results || [];
                } else if (movie.keywords) {
                    rawKeywords = movie.keywords.keywords || movie.keywords.results || [];
                }
                var keywordsList = rawKeywords.slice(0, 10).map(function (k) { return k.name; }).join(', ');

                var cacheKey = 'scan_' + movie.id;
                if (cache[cacheKey]) {
                    renderResult(box, cache[cacheKey], 'Кеш');
                    return;
                }

                fetchAI(title, origTitle, year, genres, keywordsList, overview, function (data) {
                    if (data) {
                        cache[cacheKey] = data;
                        renderResult(box, data, 'ШІ');
                    } else {
                        var fallback = getFallback(movie, keywordsList);
                        renderResult(box, fallback, 'База');
                    }
                });
            }
        });
    }

    function fetchAI(title, origTitle, year, genres, keywords, overview, callback) {
        var prompt = 'Проаналізуй фільм: "' + title + '" (' + origTitle + ', ' + year + '). ' +
            'Жанри: ' + genres + '. Теги: ' + keywords + '. Опис: ' + overview + '. ' +
            'Поверни ТІЛЬКИ JSON без оформлення: ' +
            '{"action":0,"drama":0,"comedy":0,"horror":0,"romance":0,"crime":0,"summary":"короткий опис сюжету та атмосфери українською мовою"} ' +
            'де числа від 0 до 10 для категорій: action (екшн), drama (драма), comedy (комедія), horror (жахи), romance (романтика), crime (кримінал).';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://text.pollinations.ai/' + encodeURIComponent(prompt) + '?json=true&seed=' + Math.floor(Math.random() * 1000), true);
        xhr.timeout = 8000;

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var match = xhr.responseText.match(/\{[\s\S]*\}/);
                    if (match) {
                        var parsed = JSON.parse(match[0]);
                        if (typeof parsed.action !== 'undefined') {
                            callback(parsed);
                            return;
                        }
                    }
                } catch (err) {}
            }
            callback(null);
        };
        xhr.onerror = function () { callback(null); };
        xhr.ontimeout = function () { callback(null); };
        xhr.send();
    }

    function getFallback(movie, keywords) {
        var g = (movie.genres || []).map(function (x) { return x.id; });
        return {
            action: (g.indexOf(28) !== -1 || g.indexOf(12) !== -1) ? 8 : 3,
            drama: g.indexOf(18) !== -1 ? 8 : 4,
            comedy: g.indexOf(35) !== -1 ? 8 : 2,
            horror: g.indexOf(27) !== -1 ? 8 : 1,
            romance: g.indexOf(10749) !== -1 ? 8 : 2,
            crime: g.indexOf(80) !== -1 ? 8 : 2,
            summary: movie.overview ? movie.overview.slice(0, 140) + '...' : 'Опис відсутній.'
        };
    }

    function renderResult(box, data, sourceLabel) {
        box.find('#scanner-state').text(sourceLabel);

        var html = '<div class="lampa-scanner__grid">' +
            createItem('Екшен', data.action, '#e50914') +
            createItem('Драма', data.drama, '#3b82f6') +
            createItem('Комедія', data.comedy, '#10b981') +
            createItem('Жахи', data.horror, '#8b5cf6') +
            createItem('Романтика', data.romance, '#ec4899') +
            createItem('Кримінал', data.crime, '#f59e0b') +
        '</div>' +
        '<div class="lampa-scanner__summary"><b>Сюжет:</b> ' + (data.summary || 'Дані оновлено.') + '</div>';

        box.find('.lampa-scanner__body').html(html);
    }

    function createItem(label, val, color) {
        var num = parseInt(val, 10);
        if (isNaN(num)) num = 0;
        if (num > 10) num = 10;
        var width = Math.max(5, num * 10);

        return (
            '<div class="lampa-scanner__item">' +
                '<div class="lampa-scanner__line">' +
                    '<span>' + label + '</span>' +
                    '<span class="lampa-scanner__val">' + num + '/10</span>' +
                '</div>' +
                '<div class="lampa-scanner__bar">' +
                    '<div class="lampa-scanner__fill" style="width: ' + width + '%; background: ' + color + ';"></div>' +
                '</div>' +
            '</div>'
        );
    }

    if (window.appready) {
        startOnlineScanner();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startOnlineScanner();
        });
    }
})();

