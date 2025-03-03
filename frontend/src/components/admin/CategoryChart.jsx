import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryChart = ({ categories }) => {
    const data = {
        labels: categories.map(category => category.name),
        datasets: [
            {
                label: 'Количество товаров',
                data: categories.map(category => category.productCount || 0), // Пример: количество товаров в категории
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Распределение товаров по категориям',
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default CategoryChart;