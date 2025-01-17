const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Добавляем CORS middleware
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'date.json');

// Обновляем структуру данных в файле
async function ensureFile() {
	try {
		await fs.access(DATA_FILE);
		// Проверяем и обновляем формат данных
		const data = await fs.readFile(DATA_FILE, 'utf-8');
		const jsonData = JSON.parse(data);

		// Если старый формат, преобразуем в новый
		if (!jsonData.incidents) {
			const updatedData = {
				currentDate: jsonData.date || new Date(),
				incidents: []
			};
			await fs.writeFile(DATA_FILE, JSON.stringify(updatedData));
		}
	} catch {
		const initialData = {
			currentDate: new Date(),
			incidents: []
		};
		await fs.writeFile(DATA_FILE, JSON.stringify(initialData));
	}
}

app.get('/api/get-date', async (req, res) => {
	try {
		const data = await fs.readFile(DATA_FILE, 'utf-8');
		res.json(JSON.parse(data));
	} catch (error) {
		res.status(500).json({ error: 'Ошибка чтения даты' });
	}
});

app.post('/api/reset-date', async (req, res) => {
	try {
		const data = await fs.readFile(DATA_FILE, 'utf-8');
		const jsonData = JSON.parse(data);

		// Обновляем текущую дату
		jsonData.currentDate = req.body.date;

		// Добавляем новый инцидент в начало массива
		jsonData.incidents.unshift({
			date: req.body.date
		});

		// Оставляем только последние 5 инцидентов
		jsonData.incidents = jsonData.incidents.slice(0, 5);

		await fs.writeFile(DATA_FILE, JSON.stringify(jsonData));
		res.json(jsonData);
	} catch (error) {
		res.status(500).json({ error: 'Ошибка сохранения даты' });
	}
});

ensureFile().then(() => {
	app.listen(3000, () => {
		console.log('Сервер запущен на порту 3000');
	});
});
