'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiDownload, FiAlertTriangle, FiDroplet, FiTrendingUp, FiTrendingDown, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import BackButton from '@/components/ui/BackButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Alert from '@/components/ui/Alert';
import Tooltip from '@/components/ui/Tooltip';
import { supabase } from '@/lib/supabase';

type Inventario = {
  id: number;
  litros_ingresados: number;
  litros_disponibles: number;
  fecha_ingreso: string;
  usuario_id: number;
  usuario_nombre?: string;
  observaciones?: string;
  tipo_combustible?: string;
};

type InventarioResumen = {
  gasoil: number;
  gasolina: number;
};

export default function InventarioPage() {
  const [inventario, setInventario] = useState<InventarioResumen>({ gasoil: 0, gasolina: 0 });
  const [historial, setHistorial] = useState<Inventario[]>([]);
  const [litros, setLitros] = useState('');
  const [tipoCombustible, setTipoCombustible] = useState('gasoil');
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const cargarInventario = async () => {
    try {
      // 1. Obtener inventario actual por tipo
      const { data: invData, error: invError } = await supabase
        .from('inventario')
        .select('*');
      
      if (invError) throw invError;
      
      // 2. Obtener historial detallado
      const { data: histData, error: histError } = await supabase
        .from('inventario_historial')
        .select('*')
        .order('fecha_ingreso', { ascending: false });
      
      if (histError) throw histError;
      
      const resumen: InventarioResumen = { gasoil: 0, gasolina: 0 };
      if (invData) {
        invData.forEach((item: any) => {
          if (item.tipo_combustible === 'gasoil') resumen.gasoil = item.litros_disponibles || 0;
          if (item.tipo_combustible === 'gasolina') resumen.gasolina = item.litros_disponibles || 0;
        });
      }
      
      setInventario(resumen);
      setHistorial(histData || []);
    } catch (error) {
      console.error('Error al cargar el inventario:', error);
      toast.error('Error al cargar el inventario');
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!litros || isNaN(Number(litros)) || Number(litros) <= 0) {
      toast.error('Ingrese una cantidad válida de litros');
      return;
    }
    
    try {
      setIsLoading(true);
      const litrosNum = parseFloat(litros);

      // 1. Obtener registro actual del tanque
      const { data: currentInv } = await supabase
        .from('inventario')
        .select('*')
        .eq('tipo_combustible', tipoCombustible)
        .single();

      const nuevosLitros = (currentInv?.litros_disponibles || 0) + litrosNum;

      // 2. Actualizar inventario
      const { error: updateError } = await supabase
        .from('inventario')
        .update({ 
          litros_disponibles: nuevosLitros,
          litros_ingresados: (currentInv?.litros_ingresados || 0) + litrosNum,
          fecha_ingreso: new Date().toISOString()
        })
        .eq('tipo_combustible', tipoCombustible);

      if (updateError) throw updateError;

      // 3. Registrar en historial
      await supabase.from('inventario_historial').insert({
        litros_ingresados: litrosNum,
        litros_disponibles: nuevosLitros,
        tipo_combustible: tipoCombustible,
        observaciones,
        fecha_ingreso: new Date().toISOString()
      });
      
      toast.success('Inventario actualizado correctamente');
      setLitros('');
      setObservaciones('');
      cargarInventario();
    } catch (error: any) {
      console.error('Error al actualizar inventario:', error);
      toast.error('Error al actualizar el inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Está seguro de que desea resetear todo el inventario a 0 litros?')) {
      return;
    }

    try {
      setIsLoading(true);
      await supabase.from('inventario').update({ 
        litros_disponibles: 0,
        litros_ingresados: 0 
      }).neq('id', 0); // Resetear todos

      await supabase.from('inventario_historial').insert({
        litros_ingresados: 0,
        litros_disponibles: 0,
        tipo_combustible: 'reset',
        observaciones: 'Reseteo general de inventario',
        fecha_ingreso: new Date().toISOString()
      });

      toast.success('Inventario reseteado');
      cargarInventario();
    } catch (error: any) {
      console.error('Error al resetear:', error);
      toast.error('Error al resetear el inventario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <BackButton href="/dashboard" label="Volver al Dashboard" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Inventario</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Control de combustible en tiempo real</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
        >
          <FiTrash2 className="h-4 w-4" />
          Resetear a 0
        </button>
      </div>

      {/* Alertas de inventario bajo */}
      {(inventario.gasoil < 1000 || inventario.gasolina < 1000) && (
        <Alert
          type="warning"
          title="Alerta de Inventario Bajo"
          message={`${inventario.gasoil < 1000 ? 'Gasoil' : ''}${inventario.gasoil < 1000 && inventario.gasolina < 1000 ? ' y ' : ''}${inventario.gasolina < 1000 ? 'Gasolina' : ''} por debajo del nivel mínimo. Considere reabastecer pronto.`}
          className="mb-6 animate-fade-in"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Tarjeta de Gasoil */}
        <Tooltip content="Inventario actual de Gasoil">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Gasoil</h2>
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <FiDroplet className="text-white text-xl" />
              </div>
            </div>
            
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-white">
                {inventario.gasoil.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-white mt-1 text-sm">Litros disponibles</p>
            </div>
            
            {inventario.gasoil < 1000 && (
              <div className="mt-4 p-2 bg-white bg-opacity-20 rounded-md text-xs flex items-start text-white animate-pulse">
                <FiAlertTriangle className="mt-0.5 mr-2 flex-shrink-0 text-white" />
                <span className="text-white">Nivel bajo - Reabastecer pronto</span>
              </div>
            )}
            {inventario.gasoil >= 1000 && inventario.gasoil < 5000 && (
              <div className="mt-4 p-2 bg-white bg-opacity-20 rounded-md text-xs flex items-center text-white">
                <FiTrendingDown className="mr-2 flex-shrink-0 text-white" />
                <span className="text-white">Nivel medio</span>
              </div>
            )}
            {inventario.gasoil >= 5000 && (
              <div className="mt-4 p-2 bg-white bg-opacity-20 rounded-md text-xs flex items-center text-white">
                <FiTrendingUp className="mr-2 flex-shrink-0 text-white" />
                <span className="text-white">Nivel óptimo</span>
              </div>
            )}
          </div>
        </Tooltip>

        {/* Tarjeta de Gasolina */}
        <Tooltip content="Inventario actual de Gasolina">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Gasolina</h2>
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <FiDroplet className="text-white text-xl" />
              </div>
            </div>
            
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-white">
                {inventario.gasolina.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-white mt-1 text-sm">Litros disponibles</p>
            </div>
            
            {inventario.gasolina < 1000 && (
              <div className="mt-4 p-2 bg-white bg-opacity-20 rounded-md text-xs flex items-start text-white animate-pulse">
                <FiAlertTriangle className="mt-0.5 mr-2 flex-shrink-0 text-white" />
                <span className="text-white">Nivel bajo - Reabastecer pronto</span>
              </div>
            )}
            {inventario.gasolina >= 1000 && inventario.gasolina < 5000 && (
              <div className="mt-4 p-2 bg-white bg-opacity-20 rounded-md text-xs flex items-center text-white">
                <FiTrendingDown className="mr-2 flex-shrink-0 text-white" />
                <span className="text-white">Nivel medio</span>
              </div>
            )}
            {inventario.gasolina >= 5000 && (
              <div className="mt-4 p-2 bg-white bg-opacity-20 rounded-md text-xs flex items-center text-white">
                <FiTrendingUp className="mr-2 flex-shrink-0 text-white" />
                <span className="text-white">Nivel óptimo</span>
              </div>
            )}
          </div>
        </Tooltip>

        {/* Formulario de ingreso de combustible */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md md:col-span-2 transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Registrar Ingreso de Combustible</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipo_combustible" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Combustible
                </label>
                <select
                  id="tipo_combustible"
                  value={tipoCombustible}
                  onChange={(e) => setTipoCombustible(e.target.value)}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-3 pr-10 py-2 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  disabled={isLoading}
                >
                  <option value="gasoil">Gasoil</option>
                  <option value="gasolina">Gasolina</option>
                </select>
              </div>
              <div>
                <label htmlFor="litros" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cantidad de litros
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="litros"
                    step="0.01"
                    min="0.01"
                    value={litros}
                    onChange={(e) => setLitros(e.target.value)}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-4 pr-12 py-2 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                    placeholder="Ej: 10000.00"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observaciones (Opcional)
              </label>
              <textarea
                id="observaciones"
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder="Ej: Carga de camión cisterna #1234"
                disabled={isLoading}
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !litros}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isLoading || !litros ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiPlus className="mr-2" />
                {isLoading ? 'Registrando...' : 'Registrar Ingreso'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Historial de inventario */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-300">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Historial de Movimientos
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Registro de todos los ingresos y salidas de combustible.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Litros Ingresados
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Litros Disponibles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registrado por
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {historial.length > 0 ? (
                historial.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.fecha_ingreso).toLocaleString('es-VE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.tipo_combustible === 'gasoil' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {item.tipo_combustible === 'gasoil' ? 'Gasoil' : 'Gasolina'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.litros_ingresados.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {item.litros_disponibles.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.usuario_nombre || 'Sistema'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.observaciones || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No hay registros de inventario
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
