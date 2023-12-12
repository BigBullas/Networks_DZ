import { message } from "./message/message.js"; 
const list = document.getElementById("list"); // список ответов от сервера
const startButton = document.getElementById("start"); // кнопка запуска long polling запросов
const finishButton = document.getElementById("finish"); // кнопка завершения long polling запросов
let isPolling = false; // текущее состояние запросов

// для корректной работы проверочной матрицы можно брать только 1101 и 1101
const generatingPolynomial = "1011"; // g
let verificationMatrix = ["1", "10", "100", "11", "110", "111", "101"]; // H

let corrupted_polynomial; // L
let encoded_polynomial; // S
let error_count; 
let original_polynomial; // a

const decoding = (data) => {
	({corrupted_polynomial, encoded_polynomial, error_count, original_polynomial} = data);

	// console.log("-----------------------------------");
	// console.log("data: ", corrupted_polynomial, encoded_polynomial, error_count, original_polynomial); // delete
	// console.log("*********");

	const remainder = getRemainder(corrupted_polynomial);

	// console.log("*********");
	// console.log("received remainder: ", remainder);

	let index = verificationMatrix.findIndex(element => element === remainder);

	// console.log("index in verificationMatrix: ", index);

	let decodedPolynomial = corrupted_polynomial.slice(0, corrupted_polynomial.length - 3);

	if (index < 0) {
		if (original_polynomial === decodedPolynomial) { // a === as
			// console.log(mesage(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 1));
			return message(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 1);
		} else {
			// console.log(message(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 4));
			return message(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 4);
		}
	} else {
		let correctedPolynomial = corrupted_polynomial;
		index = corrupted_polynomial.length - index - 1;

		// console.log("before: ", correctedPolynomial, index); // delete

		correctedPolynomial = correctedPolynomial.substring(0, index) + String(correctedPolynomial[index] ^ 1) + correctedPolynomial.substring(index + 1);

		// console.log("after", correctedPolynomial); // delete

		decodedPolynomial = correctedPolynomial.slice(0, corrupted_polynomial.length - 3);

		if (original_polynomial === decodedPolynomial) {
			// console.log(message(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 2));
			return message(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 2);
		} else {
			// console.log(message(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 3));
			return message(original_polynomial, encoded_polynomial, corrupted_polynomial, decodedPolynomial, error_count, 3)
		}
	}
}

const getRemainder = (polynomial) => {
	let indexEnd = generatingPolynomial.length - 1;
	let currentDigit = polynomial.slice(0, indexEnd + 1);
	let remainder;

	// console.log("start before first loop", indexEnd, currentDigit, polynomial);

	while (indexEnd < polynomial.length) {
		remainder = (parseInt(currentDigit, 2) ^ parseInt(generatingPolynomial, 2)).toString(2);
		currentDigit = remainder;

		// console.log("start before second loop", remainder);

		if ((++indexEnd) < polynomial.length) {
			while (indexEnd < polynomial.length && currentDigit.length < generatingPolynomial.length) {
				currentDigit += polynomial[indexEnd++];
				currentDigit = String(+currentDigit);
				// console.log("in second loop", currentDigit, indexEnd);

			}
			
			if (currentDigit.length < generatingPolynomial.length) {
				remainder = currentDigit;
			} else {
				indexEnd--;
			}

			// console.log("after second loop", currentDigit, indexEnd);
		}

	}
	
	// console.log(remainder, " \n");

	return remainder;
}

const subscribe = async () => {
	try {
		const response = await fetch("/long-polling-request");

		const node = document.createElement("li");

		if (response.status === 200) {
			const data = await response.json();
			node.innerHTML = decoding(data);
		} else if (response.status === 502) {
			node.innerText = "Превышено время ожидания ответа от сервера (> 7с)";
		}

		list.appendChild(node);

		// если соединение еще не прервано, то рекурсивно запускаем функцию subscribe
		if (isPolling) {
			subscribe();
		}
	} catch (e) {
		// если в процессе запроса возникла непредвиденная ошибка на сервере, то запускаем функцию через 1с
		setTimeout(() => {
			// если соединение еще не прервано, то рекурсивно запускаем функцию subscribe
			if (isPolling) {
				subscribe();
			}
		}, 1000);
	}
};

// функция вызывается при нажатии на кнопку "начать"
const startConnectToServer = () => {
	finishButton.disabled = false;
	startButton.disabled = true;
	isPolling = true;

	subscribe();
};

// функция вызывается при нажатии на кнопку "закончить"
const finishConnectToServer = () => {
	startButton.disabled = false;
	finishButton.disabled = true;
	isPolling = false;
};

startButton.addEventListener("click", startConnectToServer);
finishButton.addEventListener("click", finishConnectToServer);
