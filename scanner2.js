(function () {
    'use strict';

    var cache = {};

    function startOnlineScanner() {
        if (!document.getElementById('lampa-online-scanner-css')) {
            var css = `
                .vip-online-scanner {
                    background: rgba(12, 15, 24, 0.82);
                    backdrop-filter: blur(22px);
                    -webkit-backdrop-filter: blur(22px);
                    border: 1px solid rgba(0, 229, 255, 0.28);
                    border-radius: 18px;
                    padding: 15px 18px;
                    margin: 14px 0;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65), 0 0 22px rgba(0, 229, 255, 0.12);
                    max-width: 720px;
                    transition: all 0.3s ease;
                }
                .vip-scanner__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .vip-scanner__title {
                    font-size: 1.05em;
                    font-weight: 800;
                    color: #00e5ff;
                    text-shadow: 0 0 12px rgba(0, 229, 255, 0.45);
                }
                .vip-scanner__badge {
                    font-size: 0.78em;
                    font-weight: 700;
                    padding: 3px 9px;
                    border-radius: 8px;
                    background: rgba(0, 230, 118, 0.18);
                    color: #00e676;
                    border: 1px solid rgba(0, 230, 118, 0.4);
                }
                .vip-scanner__loading {
                    color: #ffae00;
                    font-size: 0.95em;
                    padding: 10px 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .vip-scanner__grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
                    gap: 10px 18px;
                }
                .vip-scanner__item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .vip-scanner__head {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.88em;
                    color: #e0e0e0;
                }
                .vip-scanner__score {
                    font-weight: 800;
                    color: #ffffff;
                }
                .vip-scanner__bar {
                    height: 7px;
                    background: rgba(255, 255, 255, 0.09);
                    border-radius: 6px;
                    overflow: hidden;
                }
                .vip-scanner__fill {
                    height: 100%;
                    border-radius: 6px;
                    transition: width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .vip-scanner__verdict {
                    margin-top: 12px;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-left: 3px solid #ff9900;
                    border-radius: 8px;
                    font-size: 0.9em;
                    line-height: 1.4;
                    color: #f0f0f0;
                }
                .vip-scanner__tags {
                    margin-top: 8px;
                    font-size: 0.8em;
                    color: #9e9e9e;
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
                if (render.find('.vip-online-scanner').length) return;

                var box = $(
                    '<div class="vip-online-scanner">' +
                        '<div class="vip-scanner__header">' +
                            '<span class="vip-scanner__title">🌐 ОНЛАЙН-СКАНЕР ФІЛЬМУ</span>' +
                            '<span class="vip-scanner__badge" id="scanner-status">🔄 Запит в інтернет...</span>' +
                        '</div>' +
                        '<div class="vip-scanner__body">' +
                            '<div class="vip-scanner__loading">⏳ Нейромережа аналізує сюжет, віковий рейтинг і відгуки...</div>' +
                        '</div>' +
                    '</div>'
                );

                var target = render.find('.full-descr');
                if (target.length) {
                    target.before(box);
                } else {
                    render.find('.full-start-new__buttons, .full-start__buttons').after(box);
                }

                // Збираємо реальні онлайн-дані з TMDB
                var title = movie.title || movie.name || '';
                var origTitle = movie.original_title || movie.original_name || '';
                var year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                var overview = movie.overview || '';
                var genres = (movie.genres || []).map(function (g) { return g.name; }).join(', ');

                // Витягуємо реальні ключові слова (теги) з бази TMDB, якщо вони є
                var rawKeywords = [];
                if (e.data.keywords) {
                    rawKeywords = e.data.keywords.keywords || e.data.keywords.results || [];
                } else if (movie.keywords) {
                    rawKeywords = movie.keywords.keywords || movie.keywords.results || [];
                }
                var keywordsList = rawKeywords.slice(0, 12).map(function (k) { return k.name; }).join(', ');

                var cacheKey = 'scan_' + movie.id;
                if (cache[cacheKey]) {
                    renderResult(box, cache[cacheKey], keywordsList, '🟢 ОНЛАЙН ШІ (КЕШ)');
                    return;
                }

                // Запит до безкоштовного онлайн ШІ
                fetchOnlineAI(title, origTitle, year, genres, keywordsList, overview, function (aiData) {
                    if (aiData) {
                        cache[cacheKey] = aiData;
                        renderResult(box, aiData, keywordsList, '🟢 ОНЛАЙН ШІ-АНАЛІЗ');
                    } else {
                        // Якщо інтернет слабкий або сервер ШІ зайнятий — робимо чесний розрахунок по базі TMDB
                        var fallbackData = analyzeFromTMDB(movie, keywordsList);
                        renderResult(box, fallbackData, keywordsList, '🟡 ОНЛАЙН БАЗА TMDB');
                    }
                });
            }
        });
    }

    function fetchOnlineAI(title, origTitle, year, genres, keywords, overview, callback) {
        var prompt = 'Проаналізуй фільм/серіал: "' + title + '" (' + origTitle + ', ' + year + '). ' +
            'Жанри: ' + genres + '. Теги TMDB: ' + keywords + '. Опис: ' + overview + '. ' +
            'Поверни ТІЛЬКИ чистий JSON без markdown за шаблоном: ' +
            '{"horror":0,"love":0,"action":0,"humor":0,"trash":0,"tension":0,"verdict":"короткий чесний опис українською (1-2 речення), що реально відбувається у фільмі і чи варто дивитись"} ' +
            'де числа від 0 до 10: horror (жахи/страх), love (любов/романтика/18+), action (екшн/бійки), humor (гумор), trash (жесть/расизм/чорнуха/кримінал/лайка/провокації), tension (інтрига/драма). Будь максимально точним і чесним!';

        var xhr = new XMLHttpRequest();
        var url = 'https://text.pollinations.ai/' + encodeURIComponent(prompt) + '?json=true&seed=' + Math.floor(Math.random() * 1000);
        xhr.open('GET', url, true);
        xhr.timeout = 9000;

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var text = xhr.responseText;
                    var match = text.match(/\{[\s\S]*\}/);
                    if (match) {
                        var data = JSON.parse(match[0]);
                        if (typeof data.horror !== 'undefined') {
                            callback(data);
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

    function analyzeFromTMDB(movie, keywords) {
        var g = (movie.genres || []).map(function (x) { return x.id; });
        var text = ((movie.overview || '') + ' ' + keywords).toLowerCase();

        var horror = g.indexOf(27) !== -1 ? 8 : (g.indexOf(53) !== -1 ? 5 : 1);
        var love = g.indexOf(10749) !== -1 ? 8 : 2;
        var action = (g.indexOf(28) !== -1 || g.indexOf(12) !== -1) ? 8 : 3;
        var humor = g.indexOf(35) !== -1 ? 8 : 2;
        var trash = (g.indexOf(80) !== -1 || movie.adult) ? 7 : 2;
        var tension = (g.indexOf(53) !== -1 || g.indexOf(9648) !== -1 || g.indexOf(18) !== -1) ? 8 : 4;

        if (/murder|blood|gore|zombie|monster|ghost|жах|кров|вбив|смерт/.test(text)) { horror = Math.min(10, horror + 2); trash = Math.min(10, trash + 2); }
        if (/sex|nudity|love|romance|erotic|кохан|любов|пристраст/.test(text)) love = Math.min(10, love + 2);
        if (/racism|drugs|gang|mafia|violence|abuse|расизм|наркот|мафі|злочин|банд/.test(text)) trash = Math.min(10, trash + 3);

        return {
            horror: horror,
            love: love,
            action: action,
            humor: humor,
            trash: trash,
            tension: tension,
            verdict: 'Дані зібрано з онлайн-каталогу TMDB на основі жанрів, вікового рейтингу та ключових тегів сюжету.'
        };
    }

    function renderResult(box, data, keywordsList, badgeText) {
        box.find('#scanner-status').text(badgeText);

        var html = '<div class="vip-scanner__grid">' +
            createBar('😱 Жахи і кріпота', data.horror, '#ff1e56') +
            createBar('❤️ Любов та 18+', data.love, '#ff5e9c') +
            createBar('🔥 Екшн і двіж', data.action, '#ff9900') +
            createBar('😂 Гумор і рофли', data.humor, '#00e676') +
            createBar('🤬 Жесть / Расизм / Провокації', data.trash, '#b388ff') +
            createBar('🕵️ Інтрига і напруга', data.tension, '#00e5ff') +
        '</div>' +
        '<div class="vip-scanner__verdict">💬 <b>Що відбувається у фільмі:</b> ' + (data.verdict || 'Опис завантажено.') + '</div>';

        if (keywordsList) {
            html += '<div class="vip-scanner__tags">🏷️ <b>Реальні теги з бази TMDB:</b> ' + keywordsList + '</div>';
        }

        box.find('.vip-scanner__body').html(html);
    }

    function createBar(label, score, color) {
        var num = parseInt(score, 10);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 10) num = 10;
        var percent = Math.max(6, num * 10);

        return (
            '<div class="vip-scanner__item">' +
                '<div class="vip-scanner__head">' +
                    '<span>' + label + '</span>' +
                    '<span class="vip-scanner__score">' + num + ' / 10</span>' +
                '</div>' +
                '<div class="vip-scanner__bar">' +
                    '<div class="vip-scanner__fill" style="width:' + percent + '%; background:' + color + '; box-shadow: 0 0 8px ' + color + ';"></div>' +
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
