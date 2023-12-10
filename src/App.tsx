import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setError('Error al obtener categorías. Inténtalo de nuevo más tarde.');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setError('Error al obtener productos. Inténtalo de nuevo más tarde.');
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const addToCart = (product: any) => {
    const existingProductIndex = cart.findIndex(
      (item) => item.product.ID_PRODUCTO === product.ID_PRODUCTO
    );

    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (product: any) => {
    const existingProductIndex = cart.findIndex(
      (item) => item.product.ID_PRODUCTO === product.ID_PRODUCTO
    );

    if (existingProductIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity -= 1;

      if (updatedCart[existingProductIndex].quantity <= 0) {
        updatedCart.splice(existingProductIndex, 1);
      }

      setCart(updatedCart);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.product.PRECIO * item.quantity,
      0
    );
    const iva = subtotal * 0.16; // IVA del 16%
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const buyProductsAsync = async () => {
    try {
      // Calcula el monto neto y bruto
      const subtotal = cart.reduce(
        (acc, item) => acc + item.product.PRECIO * item.quantity,
        0
      );
      const iva = subtotal * 0.16; // IVA del 16%
      const total = subtotal + iva;

      // Prepara los datos del pedido
      const orderData = {
        id_cliente: 1, // Aquí debes obtener el ID_CLIENTE desde la autenticación
        monto_neto: subtotal,
        monto_bruto: total,
        items: cart.map((item) => ({
          id_producto: item.product.ID_PRODUCTO,
          cantidad: item.quantity,
          monto_total_producto: item.product.PRECIO * item.quantity,
        })),
      };

      // Realiza la solicitud al servidor para crear el pedido
      const response = await axios.post(
        'http://localhost:5000/api/create-order',
        orderData
      );

      // Muestra un mensaje de éxito y redirige a la página de inicio de sesión después de 10 segundos
      alert(response.data.message);
      setTimeout(() => {
        // Redirección después de 10 segundos
        window.location.href = '/login';
      }, 10000);

      // Limpia el carrito después de realizar la compra
      clearCart();
    } catch (error) {
      console.error('Error al comprar productos:', error);
      alert('Error al comprar productos. Inténtalo de nuevo más tarde.');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => product.CATEGORIA === selectedCategory
      )
    : products;

  return (
    <div className="app-container">
      <h1>Categorías de Productos</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="category-filter">
        <label>Filtrar por Categoría:</label>
        <select
          onChange={(e) => handleCategoryChange(e.target.value)}
          value={selectedCategory || ''}
        >
          <option value="">Todas</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <h2>Productos</h2>
      <ul className="product-list">
        {filteredProducts.map((product, index) => (
          <li key={index}>
            <div>
              <strong>{product.NOMBRE}</strong>
              <p>Precio: ${product.PRECIO}</p>
              <button onClick={() => addToCart(product)}>
                Agregar al carrito
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-container">
        <h2>Carrito</h2>
        <ul className="cart-list">
          {cart.map((item, index) => (
            <li key={index}>
              <div>
                <strong>{item.product.NOMBRE}</strong>
                <p>Precio: ${item.product.PRECIO}</p>
                <p>Cantidad: {item.quantity}</p>
                <button onClick={() => removeFromCart(item.product)}>
                  Quitar del carrito
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="cart-actions">
          <strong>Subtotal: ${calculateTotal().subtotal}</strong>
          <p>IVA (16%): ${calculateTotal().iva}</p>
          <strong>Total: ${calculateTotal().total}</strong>
          <button onClick={buyProductsAsync}>Comprar</button>
          <button onClick={clearCart}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default App;
