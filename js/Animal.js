class Animal {
    constructor(name) {
        this.name = name;
        this.newProperty = undefined;  // Инициализируем свойство, но не присваиваем ему значение
    }
}

module.exports = Animal;  // Экспортируем класс для использования в других файлах
