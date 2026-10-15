(function () {
    'use strict';

    function applyVipUI() {
        // Перевіряємо, чи стилі вже не додані, щоб не дублювати їх
        if (document.getElementById('lampa-vip-ui-style')) return;

        var css = `
            /* Плавна анімація та заокруглення постерів */
            .card__view {
                border-radius: 14px !important;
                overflow: hidden !important;
                transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.28s ease !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
            }
            .card__img {
                border-radius: 14px !important;
            }
            
            /* Ефект при наведенні на картку фільму */
            .card.focus .card__view,
            .card.hover .card__view {
                transform: scale(1.06) !important;
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.9) !important;
            }
            .card.focus .card__view::after {
                display: none !important; /* Прибираємо стандартну грубу рамку */
            }

            /* Компактні відступи між картками */
            .card {
                margin-bottom: 0.8em !important;
            }
            .items-line__head {
                margin-bottom: 0.4em !important;
            }

            /* VIP-бейдж рейтингу на постері */
            .card__vote {
                background: linear-gradient(135deg, #ff9900, #ff2a54) !important;
                color: #ffffff !important;
                font-weight: 700 !important;
                border-radius: 8px !important;
                padding: 0.25em 0.5em !important;
                bottom: 0.5em !important;
                right: 0.5em !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5) !important;
            }

            /* Кнопки у повній картці фільму (ефект скла) */
            .full-start__button,
            .full-start-new__buttons .full-start__button {
                border-radius: 12px !important;
                background: rgba(255, 255, 255, 0.08) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(255, 255, 255, 0.14) !important;
                padding: 0.6em 1.1em !important;
                transition: transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease !important;
            }
            .full-start__button.focus {
                background: #ffffff !important;
                color: #000000 !important;
                transform: scale(1.05) !important;
                box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3) !important;
            }

            /* Ліве меню — плавність та компактність */
            .menu__item {
                border-radius: 10px !important;
                margin-bottom: 0.2em !important;
                padding: 0.65em 1em !important;
                transition: transform 0.2s ease, background 0.2s ease !important;
            }
            .menu__item.focus,
            .menu__item.hover {
                transform: translateX(6px) !important;
                background: rgba(255, 255, 255, 0.15) !important;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
            }

            /* Модальні вікна та налаштування з розмиттям (Blur) */
            .settings__content,
            .selectbox__content,
            .modal__content {
                background: rgba(18, 18, 24, 0.82) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            .modal__content {
                border-radius: 18px !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
            }

            /* Верхня панель (іконки пошуку, налаштувань) */
            .head__action {
                border-radius: 50% !important;
                transition: transform 0.2s ease, background 0.2s ease !important;
            }
            .head__action.focus {
                transform: scale(1.12) !important;
            }
        `;

        var style = document.createElement('style');
        style.id = 'lampa-vip-ui-style';
        style.innerHTML = css;
        document.head.appendChild(style);

        // Вмикаємо примусово анімації та скляний інтерфейс у налаштуваннях Lampa
        Lampa.Storage.set('glass_style', true);
        Lampa.Storage.set('light_version', false);

        Lampa.Noty.show('✨ VIP Інтерфейс активовано');
    }

    if (window.appready) {
        applyVipUI();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') applyVipUI();
        });
    }
})();
