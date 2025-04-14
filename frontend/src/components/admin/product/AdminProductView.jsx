import React, { useState, useEffect } from "react";
import { Table, Image, Space, Button, Tag } from "antd";

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
            key: 'image',
            render: () => (
                <Image 
                    width={64}
                    src="http://localhost:8080/static/весна/wave.jpg"
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