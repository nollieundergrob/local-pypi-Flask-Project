function copyToClipboard(button) {
    try {
        // Находим ближайший элемент с классом .copy-text
        const textElement = button.closest('.install_panel').querySelector('.copy-text');
        
        if (textElement) {
            const text = textElement.textContent.trim(); // Получаем текст
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                // Используем современный API для копирования
                navigator.clipboard.writeText(text)
                    .then(() => {
                        showNotification("Copied to clipboard!", "success"); // Успешное уведомление
                    })
                    .catch(err => {
                        console.error("Failed to copy text: ", err);
                        showNotification("Failed to copy text.", "error"); // Ошибка уведомления
                    });
            } else {
                // Альтернативный метод копирования
                const tempInput = document.createElement('textarea');
                tempInput.value = text;
                tempInput.style.position = 'absolute';
                tempInput.style.left = '-9999px';
                document.body.appendChild(tempInput);
                tempInput.select();
                try {
                    document.execCommand('copy'); // Устаревший метод, но работает в старых браузерах
                    showNotification("Copied to clipboard!", "success"); // Успешное уведомление
                } catch (err) {
                    console.error("Fallback: Failed to copy text: ", err);
                    showNotification("Fallback: Failed to copy text.", "error"); // Ошибка уведомления
                }
                document.body.removeChild(tempInput);
            }
        } else {
            console.error("Error: Element with class 'copy-text' not found.");
            showNotification("Text element not found.", "error");
        }
    } catch (err) {
        console.error("Error in copyToClipboard: ", err);
        showNotification("Unexpected error occurred.", "error");
    }
}


// Функция для показа уведомления
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    // Плавное появление
    setTimeout(() => {
        notification.classList.add("show");
    }, 300);

    // Удаление уведомления через 2 секунды
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 500); // Длительность исчезновения
    }, 2000);
}



document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('autocomplete-suggestions');
    const libraryList = document.getElementById('libraryList');
    const modal = document.getElementById('modal');
    const openModalButton = document.getElementById('openModal');
    const closeModalButton = document.getElementById('closeModal');
    const fullLibraryList = document.getElementById('fullLibraryList');
    const sortAscButton = document.getElementById('sortAsc');
    const sortDescButton = document.getElementById('sortDesc');

    // Получаем список библиотек из HTML
    const libraries = Array.from(libraryList.querySelectorAll('.res')).map(el => el.textContent.trim());

    // Автодополнение
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        suggestionsBox.innerHTML = '';

        if (query) {
            const filteredLibraries = libraries.filter(lib => lib.toLowerCase().includes(query));

            filteredLibraries.forEach(lib => {
                const suggestion = document.createElement('div');
                suggestion.className = 'suggestion';
                suggestion.textContent = lib;
                suggestion.addEventListener('click', () => {
                    searchInput.value = lib;
                    suggestionsBox.innerHTML = '';
                    filterLibraries(lib);
                });
                suggestionsBox.appendChild(suggestion);
            });
        }
    });

    // Фильтрация списка библиотек
    function filterLibraries(query) {
        const links = libraryList.querySelectorAll('.res');
        links.forEach(link => {
            if (link.textContent.toLowerCase().includes(query.toLowerCase())) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    }

    // Открытие модального окна
    openModalButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Закрытие модального окна
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закрытие модального окна при клике вне содержимого
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Сортировка А-Я
    sortAscButton.addEventListener('click', () => {
        sortLibraries('asc');
    });

    // Сортировка Я-А
    sortDescButton.addEventListener('click', () => {
        sortLibraries('desc');
    });

    // Функция сортировки
    function sortLibraries(order) {
        const items = Array.from(fullLibraryList.querySelectorAll('li'));
        const sortedItems = items.sort((a, b) => {
            if (order === 'asc') {
                return a.textContent.localeCompare(b.textContent);
            } else {
                return b.textContent.localeCompare(a.textContent);
            }
        });

        // Обновляем список в модальном окне
        fullLibraryList.innerHTML = '';
        sortedItems.forEach(item => fullLibraryList.appendChild(item));
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const libraryList = document.getElementById('libraryList');

    // Получаем список библиотек из HTML
    const libraries = Array.from(libraryList.querySelectorAll('.res')).map(el => el.textContent.trim());

    // Фильтрация списка библиотек
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        const links = libraryList.querySelectorAll('.res');
        links.forEach(link => {
            if (link.textContent.toLowerCase().includes(query)) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        });
    });
});
