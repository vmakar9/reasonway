// Функція для ефективного розміщення блоків у контейнері
function efficientPlacement(blocks, container) {
    const containerWidth = container.width;
    const containerHeight = container.height;
    const blockCoordinates = [];
    let remainingSpace = containerWidth * containerHeight;
    let fullness;

    const sortedBlocks = blocks.slice().sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));

    for (let blockOrder = 0; blockOrder < sortedBlocks.length; blockOrder++) {
        const block = sortedBlocks[blockOrder];
        let bestPosition = null;
        let bestOrientation = null;
        let bestEmptySpace = Infinity;

        for (const rotate of [false, true]) {
            const [blockWidth, blockHeight] = rotate ? [block.height, block.width] : [block.width, block.height];

            for (let x = 0; x <= containerWidth - blockWidth; x++) {
                for (let y = 0; y <= containerHeight - blockHeight; y++) {
                    let emptySpace = 0;

                    // Перевірка, чи вільний простір для нового блоку
                    let isSpaceFree = true;
                    for (const existingBlock of blockCoordinates) {
                        if (
                            x < existingBlock.right &&
                            x + blockWidth > existingBlock.left &&
                            y < existingBlock.bottom &&
                            y + blockHeight > existingBlock.top
                        ) {
                            isSpaceFree = false;
                            break;
                        }
                    }

                    if (!isSpaceFree) {
                        continue; // Пропустити цю позицію, якщо є накладання
                    }

                    // Перевірка, чи внутрішня порожнина повністю оточена блоками
                    let isInternalEmptySpace = true;
                    for (let i = x + 1; i < x + blockWidth - 1; i++) {
                        for (let j = y + 1; j < y + blockHeight - 1; j++) {
                            let isCellEmpty = true;
                            for (const existingBlock of blockCoordinates) {
                                if (
                                    i < existingBlock.right &&
                                    i > existingBlock.left &&
                                    j < existingBlock.bottom &&
                                    j > existingBlock.top
                                ) {
                                    isCellEmpty = false;
                                    break;
                                }
                            }
                            if (!isCellEmpty) {
                                isInternalEmptySpace = false;
                                break;
                            }
                        }
                        if (!isInternalEmptySpace) {
                            break;
                        }
                    }

                    // Розрахунок простору, що залишається
                    for (const existingBlock of blockCoordinates) {
                        if (
                            x < existingBlock.right &&
                            x + blockWidth > existingBlock.left &&
                            y < existingBlock.bottom &&
                            y + blockHeight > existingBlock.top
                        ) {
                            emptySpace += (existingBlock.right - x) * (existingBlock.bottom - y);
                        }
                    }

                    // Збереження найкращої позиції для блока
                    if (emptySpace < bestEmptySpace && isInternalEmptySpace) {
                        bestEmptySpace = emptySpace;
                        bestPosition = { left: x, top: y, right: x + blockWidth, bottom: y + blockHeight, initialOrder: blockOrder + 1 };
                        bestOrientation = rotate;
                    }
                }
            }
        }

        // Оновлення залишкового простору та додавання блока до результатів
        remainingSpace -= bestEmptySpace;
        blockCoordinates.push(bestPosition);
    }

    // Розрахунок коефіцієнта корисного використання простору
    fullness = 1 - remainingSpace / (remainingSpace + blocks.reduce((acc, block) => acc + block.width * block.height, 0));

    return { fullness, blockCoordinates };
}

// Функція для отримання випадкового кольору в форматі #RRGGBB
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Функція для відображення блоків
function displayBlocks(blockCoordinates) {
    const container = document.body;
    const colorMap = new Map(); // Зберігає відображення розміру блока на його колір

    blockCoordinates.forEach((block) => {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.style.width = block.right - block.left + 'px';
        blockElement.style.height = block.bottom - block.top + 'px';

        // Створення унікального ідентифікатора для розміру блока
        const blockSizeKey = `${blockElement.style.width}-${blockElement.style.height}`;

        // Отримання або генерація унікального кольору для блока
        let blockColor = colorMap.get(blockSizeKey);
        if (!blockColor) {
            blockColor = getRandomColor();
            colorMap.set(blockSizeKey, blockColor);
        }

        // Встановлення кольору блоку та позиції
        blockElement.style.backgroundColor = blockColor;
        blockElement.style.left = block.left + 'px';
        blockElement.style.top = block.top + 100 + 'px'; // Зміни позначено коментарем
        blockElement.innerText = `Block ${block.initialOrder}`;
        container.appendChild(blockElement);
    });
}

// Функція для завантаження JSON файлу
function loadJSONFile(filePath, callback) {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open('GET', filePath, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(JSON.parse(xhr.responseText));
        }
    };
    xhr.send(null);
}

// Функція для відображення результатів
function displayResult(result) {
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = `
        <p>Fullness: ${result.fullness.toFixed(2)}</p> 
    `;
}

// Завантаження параметрів блоків з JSON файлу та виклик відповідних функцій
loadJSONFile('blocks.json', function (blocks) {
    const container = { width: 350, height: 300 };
    const result = efficientPlacement(blocks, container);
    displayResult(result);
    displayBlocks(result.blockCoordinates);
});
