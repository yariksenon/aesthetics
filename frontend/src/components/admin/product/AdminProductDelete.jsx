import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Select, Spin } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { confirm } = Modal;

const AdminProductDelete = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/v1/admin/products');
            setProducts(response.data);
        } catch (error) {
            message.error('Ошибка при загрузке товаров');
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const showDeleteConfirm = (product) => {
        confirm({
            title: `Вы уверены, что хотите удалить товар "${product.name}"?`,
            icon: <ExclamationCircleOutlined />,
            content: 'Это действие нельзя отменить. Все данные о товаре будут удалены.',
            okText: 'Да, удалить',
            okType: 'danger',
            cancelText: 'Отмена',
            onOk() {
                return handleDelete(product.id);
            },
            onCancel() {
                console.log('Отмена удаления');
            },
        });
    };

    const handleDelete = async (productId) => {
        try {
            setDeleteLoading(true);
            await axios.delete(`http://localhost:8080/api/v1/admin/products/${productId}`);
            message.success('Товар успешно удален');
            fetchProducts(); // Обновляем список после удаления
            setSelectedProduct(null);
        } catch (error) {
            message.error('Ошибка при удалении товара');
            console.error('Error deleting product:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
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
            render: (price) => `Br ${price.toFixed(2)}`,
            width: 120,
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => showDeleteConfirm(record)}
                    loading={deleteLoading && selectedProduct?.id === record.id}
                >
                    Удалить
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 24 }}>Удаление товаров</h2>
            
            <div style={{ marginBottom: 16 }}>
                <Select
                    showSearch
                    style={{ width: '100%', maxWidth: 500 }}
                    placeholder="Выберите товар для удаления"
                    optionFilterProp="children"
                    onChange={(value) => setSelectedProduct(products.find(p => p.id === value))}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    value={selectedProduct?.id}
                    allowClear
                >
                    {products.map(product => (
                        <Option key={product.id} value={product.id}>
                            {product.name} (ID: {product.id}, Цена: Br {product.price.toFixed(2)})
                        </Option>
                    ))}
                </Select>
            </div>

            {selectedProduct && (
                <div style={{ marginBottom: 24, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                    <h3>Выбран товар: {selectedProduct.name}</h3>
                    <p>ID: {selectedProduct.id}</p>
                    <p>Цена: Br {selectedProduct.price.toFixed(2)}</p>
                    <p>Количество: {selectedProduct.quantity}</p>
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteConfirm(selectedProduct)}
                        loading={deleteLoading}
                        style={{ marginTop: 12 }}
                    >
                        Удалить выбранный товар
                    </Button>
                </div>
            )}

            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                size="middle"
                bordered
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 24 }}
            />
        </div>
    );
};

export default AdminProductDelete;