import { Animal } from './Animal';

export function testDynamicStructureChange() {
    console.time("TS Dynamic Structure Change");
    let animals: Animal[] = [];
    for (let i = 0; i < 100000; i++) {
        let animal = new Animal("Animal " + i);
        animals.push(animal);
        if (i % 10 === 0) {
            animal.newProperty = i;
        }
    }
    console.timeEnd("TS Dynamic Structure Change");
}