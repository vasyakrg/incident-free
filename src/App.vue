<template>
  <div class="container">
    <div class="counter">
      <h1 class="days">{{ daysSince }}</h1>
      <p class="subtitle">{{ daysText }} без инцидентов</p>
      <button class="reset-button" @click="handleReset">Сброс</button>

      <div class="incidents-table">
        <h2>Последние инциденты</h2>
        <table>
          <thead>
            <tr>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="incident in sortedIncidents" :key="incident.date">
              <td>{{ formatDate(incident.date) }}</td>
            </tr>
          </tbody>
        </table>
        <button class="journal-button" @click="openJournal">
          Перейти в журнал
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const startDate = ref(null);
const daysSince = ref(0);
const incidents = ref([]);

const daysText = computed(() => {
  const days = daysSince.value;
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "дней";
  }

  if (lastDigit === 1) {
    return "день";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "дня";
  }

  return "дней";
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateDays = () => {
  if (!startDate.value) return 0;
  const start = new Date(startDate.value);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const updateDays = () => {
  daysSince.value = calculateDays();
};

const handleReset = async () => {
  const now = new Date();
  const response = await axios.post("/api/reset-date", {
    date: now.toISOString(),
  });
  startDate.value = now;
  incidents.value = response.data.incidents;
  window.open(import.meta.env.VITE_GOOGLE_URL, "_blank", "noopener");
};

const openJournal = () => {
  window.open(import.meta.env.VITE_GOOGLE_URL, "_blank", "noopener");
};

const sortedIncidents = computed(() => {
  return [...incidents.value].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
});

onMounted(async () => {
  const response = await axios.get("/api/get-date");
  startDate.value = new Date(response.data.currentDate);
  incidents.value = response.data.incidents;
  updateDays();
  setInterval(updateDays, 1000 * 60);
});
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.counter {
  text-align: center;
}

.days {
  font-size: 15rem;
  margin: 0;
  color: #333;
}

.subtitle {
  font-size: 2rem;
  color: #666;
  margin: 1rem 0 2rem;
}

.reset-button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #ff0000;
}

.incidents-table {
  margin-top: 2rem;
  padding: 1rem;
}

.incidents-table h2 {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f8f8;
  font-weight: bold;
  color: #666;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover td {
  background-color: #f5f5f5;
}

.journal-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #44b544;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.journal-button:hover {
  background-color: #339933;
}
</style>
