const express = require("express"); // импорт библиотеки express
const path = require("path"); // импорт библиотеки path для работы с путями

const app = express(); // создание экземпляра приложения express
const PORT = 3000; // присвоения порта

const generating = "1011"; // порождающий полином

const MAX_TIMEOUT = 10000; // максимальное время ожидания ответа
const MIN_TIMEOUT = 1000; // минимальное время ожидания
const MAX_VALUE = 15; // максимальное значение случайного числа
const MIN_VALUE = 1; // минимальное значение случайного числа
const ENCODED_POLY_LEN = 7;
const POLY_LEN = 4;

// настройка для передачи статических файлов (__dirname - текущая директория)
// метод join используется для соединения путей с учётом особенностей операционной системы
app.use(express.static(path.join(__dirname, "frontend")));

// по корневому запросу отдаем файл index.html из папки ./frontend
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/frontend/index.html"));
});

// описание long polling запроса
app.get("/long-polling-request", (req, res) => {
	// выбирается случайное время ожидания из отрезка [1000, 10 000]
	const timeout = Math.round(Math.random() * (MAX_TIMEOUT - MIN_TIMEOUT) + MIN_TIMEOUT);

	// выбирается случайное число из отрезка [1, 15], представляется в двоичном виде
	const value = Math.round(Math.random() * (MAX_VALUE - MIN_VALUE) + MIN_VALUE);
	let original = value.toString(2);
	original = original.padStart(POLY_LEN, "0");

	let encoded = original.padEnd(ENCODED_POLY_LEN, "0");

	// получаем остаток от деления на образующий полином
	let remainder = getRemainder(encoded);
	remainder = remainder.padStart(ENCODED_POLY_LEN - POLY_LEN, "0");

	// получаем итоговый закодированный полином
	encoded = (parseInt(encoded, 2) + parseInt(remainder, 2)).toString(2);
	encoded = encoded.padStart(ENCODED_POLY_LEN, "0");

	// берём рандомное количество ошибок (от 0 до 2)
	let errorCount = Math.round(Math.random() * 2);

	// без ошибок (0)
	let corrupted = encoded;

	// 1 ошибка
	if (errorCount === 1) {
		corrupted = makeOneErr(corrupted);
	}

	// 2 ошибки
	if (errorCount === 2) {
		corrupted = makeTwoErr(corrupted);
	}

	setTimeout(() => {
		res.send({
			original_polynomial: original,
			encoded_polynomial: encoded,
			corrupted_polynomial: corrupted,
			error_count: errorCount,
		});
	}, 1000);
});

// запуск сервера приложения
app.listen(PORT, () => {
	console.log(`Server started at http://localhost:${PORT}`);
});

const makeOneErr = (encoded_pol) => {
	// берём рандомную позицию в полиноме для ошибки
	let errIndex = Math.round(Math.random() * (ENCODED_POLY_LEN - 1));

	return encoded_pol.substring(0, errIndex) + String(encoded_pol[errIndex] ^ 1) + encoded_pol.substring(errIndex + 1);
};

const makeTwoErr = (encoded_pol) => {
	let errIndex_1 = Math.round(Math.random() * (ENCODED_POLY_LEN - 1));
	let errIndex_2 = Math.round(Math.random() * (ENCODED_POLY_LEN - 1));
	// в цикле проверяем, чтобы позиции ошибок были разные
	while (errIndex_1 === errIndex_2) {
		errIndex_2 = Math.round(Math.random() * (ENCODED_POLY_LEN - 1));
	}

	const firstIndex = Math.min(errIndex_1, errIndex_2);
	const secondIndex = Math.max(errIndex_1, errIndex_2);

	return encoded_pol.substring(0, firstIndex) + String(encoded_pol[firstIndex] ^ 1) + encoded_pol.substring(firstIndex + 1, secondIndex) 
		+ String(encoded_pol[secondIndex] ^ 1) + encoded_pol.substring(secondIndex + 1);
	
};

const getRemainder = (polynomial) => {
	let indexEnd = generating.length - 1;
	let currentDigit = polynomial.slice(0, indexEnd + 1);
	let remainder;

	while (indexEnd < polynomial.length) {
		remainder = (parseInt(currentDigit, 2) ^ parseInt(generating, 2)).toString(
			2
		);
		currentDigit = remainder;

		if (++indexEnd < polynomial.length) {
			while (
				indexEnd < polynomial.length &&
				currentDigit.length < generating.length
			) {
				currentDigit += polynomial[indexEnd++];
				currentDigit = String(+currentDigit);
			}

			if (currentDigit.length < generating.length) {
				remainder = currentDigit;
			} else {
				indexEnd--;
			}
		}
	}

	return remainder;
};
