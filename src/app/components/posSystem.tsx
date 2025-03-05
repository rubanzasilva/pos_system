'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sale } from '@/types/Sale';

export default function POSSystem() {
  // State for form inputs
  const [productName, setProductName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [salesData, setSalesData] = useState<Sale[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedSales = localStorage.getItem('salesData');
    if (savedSales) {
      setSalesData(JSON.parse(savedSales));
    }
  }, []);

  // Save data to localStorage when salesData changes
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(salesData));
  }, [salesData]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSale: Sale = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      productName,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category,
      total: parseFloat(price) * parseInt(quantity)
    };
    
    setSalesData([...salesData, newSale]);
    
    // Reset form
    setProductName('');
    setPrice('');
    setQuantity('');
    setCategory('');
  };

  // Delete a specific sale
  const deleteSale = (id: number) => {
    setSalesData(salesData.filter(sale => sale.id !== id));
  };

  // Calculate Key Performance Indicators (KPIs)
  const calculateKPIs = () => {
    if (salesData.length === 0) return { 
      totalSales: 0, 
      totalRevenue: 0, 
      avgOrderValue: 0, 
      topProduct: 'None', 
      topCategory: 'None' 
    };
    
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
    const avgOrderValue = totalRevenue / totalSales;
    
    // Calculate top product
    const productSales: {[key: string]: number} = {};
    salesData.forEach(sale => {
      productSales[sale.productName] = (productSales[sale.productName] || 0) + sale.quantity;
    });
    
    const topProduct = Object.keys(productSales).reduce((a, b) => 
      productSales[a] > productSales[b] ? a : b, 'None');
    
    // Calculate top category
    const categorySales: {[key: string]: number} = {};
    salesData.forEach(sale => {
      categorySales[sale.category] = (categorySales[sale.category] || 0) + sale.quantity;
    });
    
    const topCategory = Object.keys(categorySales).reduce((a, b) => 
      categorySales[a] > categorySales[b] ? a : b, 'None');
    
    return { totalSales, totalRevenue, avgOrderValue, topProduct, topCategory };
  };

  // Prepare data for sales chart
  const prepareChartData = () => {
    const productSales: {[key: string]: number} = {};
    
    salesData.forEach(sale => {
      productSales[sale.productName] = (productSales[sale.productName] || 0) + sale.quantity;
    });
    
    return Object.keys(productSales).map(product => ({
      name: product,
      sales: productSales[product]
    }));
  };

  // Calculate KPIs and chart data
  const kpis = calculateKPIs();
  const chartData = prepareChartData();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">Point of Sale System</h1>
        </div>

        {/* Sales Entry Form */}
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-700 mb-4">New Sale</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 ease-in-out"
              >
                Record Sale
              </button>
            </div>
          </form>
        </div>

        {/* KPI Section */}
        <div className="grid md:grid-cols-3 gap-4 p-6 bg-gray-50 border-t border-gray-200">
          {[
            { label: 'Total Revenue', value: `$${kpis.totalRevenue.toFixed(2)}` },
            { label: 'Total Sales', value: kpis.totalSales },
            { label: 'Avg. Order Value', value: `$${kpis.avgOrderValue.toFixed(2) || 0}` },
            { label: 'Top Product', value: kpis.topProduct },
            { label: 'Top Category', value: kpis.topCategory }
          ].map((kpi, index) => (
            <div key={index} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-xl font-semibold text-gray-800">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Sales Chart */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Product Sales</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{fill: '#666'}} />
                <YAxis tick={{fill: '#666'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: 'white', border: '1px solid #ddd'}}
                  labelStyle={{color: '#333', fontWeight: 'bold'}}
                />
                <Legend />
                <Bar dataKey="sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Table */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Sales History</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {['Date', 'Product', 'Category', 'Price', 'Qty', 'Total', 'Action'].map((header) => (
                    <th key={header} className="text-left p-3 text-sm font-medium text-gray-600">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesData.length > 0 ? (
                  salesData.map(sale => (
                    <tr key={sale.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-700">{sale.date}</td>
                      <td className="p-3 text-sm text-gray-700">{sale.productName}</td>
                      <td className="p-3 text-sm text-gray-700">{sale.category}</td>
                      <td className="p-3 text-sm text-gray-700">${sale.price.toFixed(2)}</td>
                      <td className="p-3 text-sm text-gray-700">{sale.quantity}</td>
                      <td className="p-3 text-sm text-gray-700">${sale.total.toFixed(2)}</td>
                      <td className="p-3 text-sm text-gray-700">
                        <button 
                          onClick={() => deleteSale(sale.id)}
                          className="text-red-600 hover:text-red-800 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center p-4 text-gray-500">
                      No sales recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clear Data Button */}
        {salesData.length > 0 && (
          <div className="p-6 border-t border-gray-200 text-right">
            <button 
              onClick={() => setSalesData([])}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
            >
              Clear All Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}