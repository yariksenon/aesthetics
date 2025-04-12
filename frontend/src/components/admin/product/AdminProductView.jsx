import React, { useState, useEffect } from "react";
import { Table, Image, Space, Button, Tag } from "antd"; // Используем Ant Design для красивого интерфейса

const AdminProductView = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/v1/admin/products");
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Изображение',
            dataIndex: 'image_path',
            key: 'image',
            render: (imagePath) => (
                <Image 
                    width={64}
                    src={imagePath.startsWith('/uploads') ? 
                        `http://your-backend-url${imagePath}` : 
                        imagePath}
                    fallback="https://via.placeholder.com/64"
                />
            ),
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `$${price.toFixed(2)}`,
        },
        {
            title: 'Количество',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Цвет',
            dataIndex: 'color',
            key: 'color',
            render: (color) => <Tag color={color.toLowerCase()}>{color}</Tag>,
        },
        {
            title: 'Размер',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Дата создания',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary">Редактировать</Button>
                    <Button danger>Удалить</Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Table 
                columns={columns} 
                dataSource={products} 
                rowKey="id"
                loading={loading}
                bordered
            />
        </div>
    );
};

export default AdminProductView;