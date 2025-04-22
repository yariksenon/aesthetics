import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminProductEdit = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/admin/products');
        setProducts(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: value
    });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Преобразуем числовые поля
      const dataToSend = {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        quantity: parseInt(editingProduct.quantity),
        sub_category_id: parseInt(editingProduct.sub_category_id)
      };

      const response = await axios.put(
        `http://localhost:8080/api/v1/admin/products/${editingProduct.id}`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
        setEditingProduct(null);
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Product Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Notifications */}
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <div className="flex justify-between">
              <p className="font-bold">Error</p>
              <button onClick={() => setError(null)} className="font-bold">&times;</button>
            </div>
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <div className="flex justify-between">
              <p className="font-bold">Success</p>
              <button onClick={() => setSuccessMessage(null)} className="font-bold">&times;</button>
            </div>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Products Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
            <h2 className="text-lg font-medium">Products List</h2>
            <span className="bg-white border border-black text-xs font-semibold px-2.5 py-0.5 rounded">
              {products.length} items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-black">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-black">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-black">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-black">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b border-black">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    {editingProduct && editingProduct.id === product.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                          <input
                            type="text"
                            name="name"
                            value={editingProduct.name || ''}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                          <div className="flex items-center">
                            <span className="mr-1">$</span>
                            <input
                              type="number"
                              name="price"
                              value={editingProduct.price || ''}
                              onChange={handleInputChange}
                              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                              step="0.01"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                          <input
                            type="number"
                            name="quantity"
                            value={editingProduct.quantity || ''}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSave}
                              disabled={isSaving}
                              className={`bg-black text-white px-3 py-1 rounded text-sm font-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-white border border-black px-3 py-1 rounded text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">{product.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200">${product.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${product.quantity > 0 ? 'border-black' : 'border-gray-400'}`}>
                            {product.quantity} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="underline"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Form */}
        {editingProduct && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-medium">Edit Product Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={editingProduct.description || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea
                  name="summary"
                  value={editingProduct.summary || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={editingProduct.color || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input
                  type="text"
                  name="size"
                  value={editingProduct.size || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={editingProduct.sku || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sub Category ID</label>
                <input
                  type="number"
                  name="sub_category_id"
                  value={editingProduct.sub_category_id || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Image Path</label>
                <input
                  type="text"
                  name="image_path"
                  value={editingProduct.image_path || ''}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-black w-full"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 text-right">
              <button
                onClick={handleCancelEdit}
                className="bg-white border border-black px-4 py-2 rounded text-sm font-medium mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`bg-black text-white px-4 py-2 rounded text-sm font-medium ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductEdit;