'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PythonTest() {
  const [message, setMessage] = useState('Cargando...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/python`);
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        setMessage('Error al conectar con el servidor Python');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Prueba de conexión con Python</h1>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <p className="text-lg">
            Respuesta del servidor Python: <span className="font-semibold text-blue-600">{message}</span>
          </p>
        )}
      </div>
    </div>
  );
}
