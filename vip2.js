(function () {
    'use strict';

    function applyVipProUI() {
        var oldStyle = document.getElementById('lampa-vip-ui-style');
        if (oldStyle) oldStyle.remove();

        var css = `
            /* === 1. НИЖНЯ ПАНЕЛЬ (ПЛАВАЮЧИЙ VIP DOCK) === */
            .navigation-bar {
                background: rgba(15, 16, 22, 0.78) !important;
                backdrop-filter: blur(25px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
                border: 1px solid rgba(255, 255, 255, 0.14) !important;
                border-radius: 24px !important;
                margin: 0 auto 10px auto !important;
                width: 92% !important;
                max-width: 500px !important;
                left: 0 !important;
                right: 0 !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.75) !important;
                padding: 4px 8px !important;
                transition: all 0.3s ease !important;
            }
            .navigation-bar__body {
                background: transparent !important;
                border: none !important;
            }
            .navigation-bar__item {
                border-radius: 16px !important;
                transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.2s ease !important;
                margin: 2px !important;
            }
            .navigation-bar__item:active,
            .navigation-bar__item.active,
            .navigation-bar__item.focus {
                background: rgba(255, 255, 255, 0.12) !important;
                transform: translateY(-3px) scale(1.06) !important;
            }
            .navigation-bar__item svg {
                transition: filter 0.2s ease !important;
            }
            .navigation-bar__item.active svg,
            .navigation-bar__item:active svg {
                filter: drop-shadow(0 0 8px rgba(255, 153, 0, 0.8)) !important;
            }

            /* === 2. ПОШУК ТА КЛАВІАТУРА === */
            .search,
            .search-box {
                background: rgba(10, 11, 16, 0.88) !important;
                backdrop-filter: blur(30px) !important;
                -webkit-backdrop-filter: blur(30px) !important;
            }
            /* Поле вводу пошуку */
            .search__input,
            .search-box__input {
                background: rgba(255, 255, 255, 0.08) !important;
                border: 1px solid rgba(255, 255, 255, 0.18) !important;
                border-radius: 16px !important;
                padding: 0.7em 1.2em !important;
                box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4) !important;
                transition: all 0.25s ease !important;
            }
            .search__input.focus,
            .search-box__input.focus {
                border-color: #ff9900 !important;
                box-shadow: 0 0 18px rgba(255, 153, 0, 0.35) !important;
                background: rgba(255, 255, 255, 0.12) !important;
            }
            /* Кнопки екранної клавіатури */
            .simple-keyboard {
                background: transparent !important;
            }
            .hg-button {
                background: rgba(255, 255, 255, 0.08) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                color: #ffffff !important;
                transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease !important;
            }
            .hg-button.focus,
            .hg-button:active {
                background: linear-gradient(135deg, #ff9900, #ff2a54) !important;
                color: #ffffff !important;
                transform: scale(1.12) !important;
                box-shadow: 0 5px 15px rgba(255, 42, 84, 0.5) !important;
                border-color: transparent !important;
                z-index: 5 !important;
            }
            /* Категорії у пошуку (Фільми, Серіали тощо) */
            .search-source {
                border-radius: 14px !important;
                background: rgba(255, 255, 255, 0.06) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                margin-right: 0.5em !important;
                transition: all 0.22s ease !important;
            }
            .search-source.active,
            .search-source.focus {
                background: #ffffff !important;
                color: #000000 !important;
                transform: scale(1.05) !important;
                box-shadow: 0 6px 20px rgba(255, 255, 255, 0.25) !important;
            }

            /* === 3. КАРТКИ ФІЛЬМІВ І ПОСТЕРИ === */
            .card__view {
                border-radius: 16px !important;
                overflow: hidden !important;
                transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.28s ease !important;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45) !important;
            }
            .card__img {
                border-radius: 16px !important;
            }
            .card.focus .card__view,
            .card.hover .card__view {
                transform: scale(1.06) translateY(-4px) !important;
                box-shadow: 0 14px 30px rgba(0, 0, 0, 0.85), 0 0 0 2px #ff9900 !important;
            }
            .card.focus .card__view::after {
                display: none !important;
            }
            /* Значок рейтингу та якості (4K / FHD) */
            .card__vote {
                background: linear-gradient(135deg, #ff9900, #ff2a54) !important;
                color: #ffffff !important;
                font-weight: 700 !important;
                border-radius: 8px !important;
                padding: 0.25em 0.5em !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5) !important;
            }
            .card__quality {
                background: linear-gradient(135deg, #f6d365, #fda085) !important;
                color: #000000 !important;
                font-weight: 800 !important;
                border-radius: 8px !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5) !important;
            }
            .card__type {
                border-radius: 8px !important;
                backdrop-filter: blur(8px) !important;
            }

            /* === 4. ОНЛАЙН ПЛЕЄРИ, СЕРІЇ ТА ТОРРЕНТИ === */
            .online-prestige,
            .torrent-item,
            .files__item {
                border-radius: 14px !important;
                background: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                margin-bottom: 0.6em !important;
                transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease !important;
            }
            .online-prestige.focus,
            .torrent-item.focus,
            .files__item.focus {
                background: rgba(255, 255, 255, 0.14) !important;
                border-color: rgba(255, 153, 0, 0.7) !important;
                transform: scale(1.015) !important;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
            }

            /* === 5. ПОВНА КАРТКА ФІЛЬМУ ТА АКТОРИ === */
            .full-start__button,
            .full-start-new__buttons .full-start__button {
                border-radius: 14px !important;
                background: rgba(255, 255, 255, 0.09) !important;
                backdrop-filter: blur(15px) !important;
                -webkit-backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                transition: all 0.22s ease !important;
            }
            .full-start__button.focus {
                background: linear-gradient(135deg, #ff9900, #ff2a54) !important;
                color: #ffffff !important;
                border-color: transparent !important;
                transform: scale(1.06) !important;
                box-shadow: 0 8px 22px rgba(255, 42, 84, 0.45) !important;
            }
            .full-person__photo {
                border-radius: 50% !important;
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.5) !important;
                transition: transform 0.25s ease !important;
            }
            .full-person.focus .full-person__photo {
                transform: scale(1.1) !important;
                box-shadow: 0 0 0 2px #ff9900 !important;
            }

            /* === 6. ВЕРХНЯ ШАПКА ТА ЛІВЕ МЕНЮ === */
            .head__action {
                border-radius: 12px !important;
                background: rgba(255, 255, 255, 0.06) !important;
                transition: all 0.2s ease !important;
            }
            .head__action.focus,
            .head__action:active {
                background: linear-gradient(135deg, #ff9900, #ff2a54) !important;
                color: #ffffff !important;
                transform: scale(1.12) !important;
            }
            .menu__item {
                border-radius: 12px !important;
                margin-bottom: 0.25em !important;
                transition: all 0.2s ease !important;
            }
            .menu__item.focus,
            .menu__item.hover {
                transform: translateX(6px) !important;
                background: linear-gradient(90deg, rgba(255, 153, 0, 0.25), rgba(255, 42, 84, 0.08)) !important;
                border-left: 3px solid #ff9900 !important;
            }

            /* === 7. НИЖНЯ ПАНЕЛЬ У ВІДЕОПЛЕЄРІ === */
            .player-panel {
                background: rgba(14, 15, 20, 0.78) !important;
                backdrop-filter: blur(22px) !important;
                -webkit-backdrop-filter: blur(22px) !important;
                border-radius: 22px !important;
                border: 1px solid rgba(255, 255, 255, 0.14) !important;
                margin: 0 2% 15px 2% !important;
                width: 96% !important;
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8) !important;
            }

            /* === 8. НАЛАШТУВАННЯ, СПИСКИ ТА СПОВІЩЕННЯ === */
            .settings__content,
            .selectbox__content,
            .modal__content {
                background: rgba(16, 17, 23, 0.86) !important;
                backdrop-filter: blur(25px) !important;
                -webkit-backdrop-filter: blur(25px) !important;
                border-left: 1px solid rgba(255, 255, 255, 0.12) !important;
            }
            .settings-param,
            .selectbox-item {
                border-radius: 12px !important;
                margin-bottom: 4px !important;
                transition: background 0.18s ease, transform 0.18s ease !important;
            }
            .settings-param.focus,
            .selectbox-item.focus {
                background: rgba(255, 255, 255, 0.12) !important;
                transform: translateX(4px) !important;
            }
            .noty {
                border-radius: 16px !important;
                background: rgba(20, 20, 28, 0.9) !important;
                backdrop-filter: blur(15px) !important;
                border: 1px solid rgba(255, 153, 0, 0.4) !important;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6) !important;
            }
        `;

        var style = document.createElement('style');
        style.id = 'lampa-vip-ui-style';
        style.innerHTML = css;
        document.head.appendChild(style);

        Lampa.Storage.set('glass_style', true);
        Lampa.Storage.set('light_version', false);

        Lampa.Noty.show('🔥 VIP UI PRO 2.0 активовано');
    }

    if (window.appready) {
        applyVipProUI();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') applyVipProUI();
        });
    }
})();
