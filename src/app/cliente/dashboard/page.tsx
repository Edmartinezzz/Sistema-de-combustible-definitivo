'use client';

import { useClienteAuth } from '@/contexts/ClienteAuthContext';
import { useRouter } from 'next/navigation';
import { FiDroplet, FiClock, FiCalendar, FiUser, FiLogOut, FiPlusCircle, FiAlertTriangle, FiTruck, FiUserPlus } from 'react-icons/fi';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import TicketModal from '@/components/TicketModal';
import InventarioAgotadoModal from '@/components/InventarioAgotadoModal';
import dynamic from 'next/dynamic';

// Cargar el modal dinámicamente para mejor rendimiento
const SubclienteFormModal = dynamic(
  () => import('@/components/SubclienteFormModal'),
  { ssr: false }
);

export default function ClienteDashboard() {
  const { cliente, logout, updateCliente } = useClienteAuth();
  const router = useRouter();
  const [litros, setLitros] = useState('');
  const [tipoCombustible, setTipoCombustible] = useState<'gasolina' | 'gasoil'>('gasolina');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const [showInventarioAgotado, setShowInventarioAgotado] = useState(false);
  const [tipoCombustibleAgotado, setTipoCombustibleAgotado] = useState('');
  const [showSubclienteModal, setShowSubclienteModal] = useState(false);

  // Todos los clientes pueden tener trabajadores (subclientes)
  const [subclienteSeleccionadoId, setSubclienteSeleccionadoId] = useState<number | null>(null);
  const esInstitucional = true;

  // Obtener datos frescos del cliente desde Supabase
  const { refetch: refetchCliente } = useQuery({
    queryKey: ['cliente-data', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return null;
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', cliente.id)
          .single();
        
        if (error) throw error;
        updateCliente(data);
        return data;
      } catch (error) {
        console.error('Error al obtener datos del cliente:', error);
        return null;
      }
    },
    enabled: !!cliente?.id,
    refetchInterval: 60000,
  });

  // Obtener agendamientos del cliente
  const { data: agendamientos = [], refetch: refetchAgendamientos } = useQuery({
    queryKey: ['agendamientos-cliente', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id) return [];
      try {
        const { data, error } = await supabase
          .from('agendamientos')
          .select('*')
          .eq('cliente_id', cliente.id)
          .order('fecha_creacion', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error al obtener agendamientos:', error);
        return [];
      }
    },
    enabled: !!cliente?.id,
    refetchInterval: 30000,
  });

  // Obtener subclientes
  const { data: subclientes = [], refetch: refetchSubclientes } = useQuery({
    queryKey: ['subclientes-cliente', cliente?.id],
    queryFn: async () => {
      if (!cliente?.id || !esInstitucional) return [];
      try {
        const { data, error } = await supabase
          .from('subclientes')
          .select('*')
          .eq('parent_id', cliente.id);
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error al obtener subclientes:', error);
        return [];
      }
    },
    enabled: !!cliente?.id && esInstitucional,
    refetchInterval: 30000,
  });

  // Obtener estado del inventario
  const { data: estadoInventario, refetch: refetchInventario } = useQuery({
    queryKey: ['inventario-estado'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('inventario')
          .select('*');
        
        if (error) throw error;
        
        const invObj: any = {};
        data.forEach(item => {
          invObj[item.tipo_combustible] = item.litros_disponibles;
        });

        const { data: config } = await supabase
          .from('sistema_config')
          .select('retiros_bloqueados')
          .single();

        return { 
          inventario: invObj, 
          disponible: !config?.retiros_bloqueados 
        };
      } catch (error) {
        console.error('Error al obtener estado del inventario:', error);
        return { inventario: {}, disponible: false };
      }
    },
    refetchInterval: 10000,
  });

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!litros || isNaN(Number(litros)) || Number(litros) <= 0) {
      toast.error('Por favor ingrese una cantidad válida');
      return;
    }

    const inventarioTipo = estadoInventario?.inventario?.[tipoCombustible] || 0;
    if (!estadoInventario?.disponible || inventarioTipo <= 0) {
      setTipoCombustibleAgotado(tipoCombustible);
      setShowInventarioAgotado(true);
      return;
    }

    const litrosNum = parseFloat(litros);

    if (esInstitucional && (!subclienteSeleccionadoId || subclienteSeleccionadoId === 0)) {
      toast.error('Seleccione un trabajador para agendar el retiro');
      return;
    }

    const litrosDisponiblesTipo = tipoCombustible === 'gasolina'
      ? (cliente?.litros_disponibles_gasolina ?? cliente?.litros_disponibles ?? 0)
      : (cliente?.litros_disponibles_gasoil ?? cliente?.litros_disponibles ?? 0);

    if (litrosNum > litrosDisponiblesTipo) {
      toast.error(`No tiene suficientes litros de ${tipoCombustible} disponibles`);
      return;
    }

    try {
      setIsLoading(true);

      const ticketCodigo = Math.floor(1000 + Math.random() * 9000).toString();
      const fechaManana = new Date();
      fechaManana.setDate(fechaManana.getDate() + 1);
      fechaManana.setHours(5, 0, 0, 0);

      // 1. Crear agendamiento
      const { data: newAgendamiento, error: insertError } = await supabase
        .from('agendamientos')
        .insert({
          cliente_id: cliente.id,
          tipo_combustible: tipoCombustible,
          litros: litrosNum,
          subcliente_id: esInstitucional ? subclienteSeleccionadoId : null,
          codigo_ticket: ticketCodigo,
          fecha_agendada: fechaManana.toISOString(),
          estado: 'pendiente',
          fecha_creacion: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Restar del cupo del cliente (esto debería ser una transacción/RPC idealmente)
      const fieldToUpdate = tipoCombustible === 'gasolina' ? 'litros_disponibles_gasolina' : 'litros_disponibles_gasoil';
      const { error: updateError } = await supabase
        .from('clientes')
        .update({ [fieldToUpdate]: litrosDisponiblesTipo - litrosNum })
        .eq('id', cliente.id);

      if (updateError) throw updateError;

      // 3. Restar del inventario general
      const { error: invError } = await supabase
        .from('inventario')
        .update({ litros_disponibles: inventarioTipo - litrosNum })
        .eq('tipo_combustible', tipoCombustible);

      if (invError) throw invError;

      const ticketInfo = {
        codigo_ticket: ticketCodigo,
        fecha_agendada: fechaManana.toISOString(),
        litros: litrosNum,
        tipo_combustible: tipoCombustible,
        cliente: {
          nombre: cliente?.nombre || '',
          cedula: cliente?.cedula || '',
          telefono: cliente?.telefono || '',
          placa: cliente?.placa || '',
          categoria: cliente?.categoria || ''
        },
        subcliente: esInstitucional
          ? subclientes.find((s: any) => s.id === subclienteSeleccionadoId) || null
          : null,
      };

      setTicketData(ticketInfo);
      setShowTicketModal(true);
      setLitros('');
      
      refetchAgendamientos();
      refetchCliente();
      refetchInventario();

    } catch (error: any) {
      console.error('Error al crear agendamiento:', error);
      toast.error('Error al procesar el agendamiento. Intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cliente) {
    return null; // El componente ClienteAuthChecker manejará la redirección
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bienvenido, {cliente.nombre}</h1>
            <p className="text-gray-600 dark:text-gray-300">Gestiona tu consumo de gas</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <FiLogOut className="mr-2" />
            Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-4">
                <FiDroplet className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gasolina Disponible</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {(cliente.litros_disponibles_gasolina ?? cliente.litros_disponibles ?? 0).toFixed(2)} <span className="text-lg">litros</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              de {(cliente.litros_mes_gasolina ?? cliente.litros_mes ?? 0).toFixed(2)} litros mensuales
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full mr-4">
                <FiTruck className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gasoil Disponible</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {(cliente.litros_disponibles_gasoil ?? 0).toFixed(2)} <span className="text-lg">litros</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              de {(cliente.litros_mes_gasoil ?? 0).toFixed(2)} litros mensuales
            </p>
          </div>


        </div>

        {/* Estado del Inventario - Sin Combustible */}
        {estadoInventario && (!estadoInventario.disponible ||
          (tipoCombustible === 'gasolina' && (estadoInventario?.inventario?.gasolina || 0) <= 0) ||
          (tipoCombustible === 'gasoil' && (estadoInventario?.inventario?.gasoil || 0) <= 0)
        ) && (
            <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-800 rounded-lg p-6 mb-6 animate-pulse transition-colors duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiAlertTriangle className="h-10 w-10 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">🚫 {tipoCombustible.toUpperCase()} NO DISPONIBLE</h3>
                  <p className="text-red-800 dark:text-red-300 font-medium mb-3">
                    El inventario de {tipoCombustible} está agotado. No se pueden realizar agendamientos hasta que se reabastezca.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-red-200 text-red-900 border border-red-400">
                      📦 {tipoCombustible}: {estadoInventario?.inventario?.[tipoCombustible] || 0} Litros
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-yellow-200 text-yellow-900 border border-yellow-400">
                      ⚠️ Estado: AGOTADO
                    </span>
                    <button
                      onClick={() => {
                        refetchInventario();
                        toast.loading('Verificando inventario...', { duration: 1000 });
                      }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      🔄 Verificar Disponibilidad
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800">
                      📞 <strong>Contacta al administrador</strong> para conocer cuándo estará disponible nuevamente el combustible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}



        {/* Formulario de agendamiento */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Agendar Retiro para Mañana</h3>

          {/* Selección de trabajador (subcliente) para clientes institucionales */}
          {esInstitucional && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trabajadores</label>
              {subclientes.length === 0 ? (
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    No tiene trabajadores registrados.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSubclienteModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-fit"
                  >
                    <FiUserPlus className="mr-1.5 h-4 w-4" />
                    Agregar Trabajador
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selecciona el trabajador y el tipo de combustible para este retiro.
                  </p>
                  <div className="space-y-2">
                    {(subclientes as any[]).map((sub) => {
                      const isSelected = subclienteSeleccionadoId === sub.id;
                      return (
                        <div
                          key={sub.id}
                          className={`flex items-center justify-between border rounded-md px-3 py-2 transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                            }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">{sub.nombre}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Cédula: {sub.cedula || 'N/A'}{sub.placa ? ` · Placa: ${sub.placa}` : ''}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSubclienteSeleccionadoId(sub.id);
                                setTipoCombustible('gasolina');
                              }}
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border ${isSelected && tipoCombustible === 'gasolina'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                }`}
                            >
                              <FiDroplet className="mr-1 h-3 w-3" />
                              Gasolina
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSubclienteSeleccionadoId(sub.id);
                                setTipoCombustible('gasoil');
                              }}
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border ${isSelected && tipoCombustible === 'gasoil'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                }`}
                            >
                              <FiTruck className="mr-1 h-3 w-3" />
                              Gasoil
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubclienteModal(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <FiUserPlus className="mr-1.5 h-4 w-4" />
                    Agregar otro Trabajador
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Selección de Tipo de Combustible (solo para clientes no institucionales) */}
          {!esInstitucional && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tipo de Combustible</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTipoCombustible('gasolina')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${tipoCombustible === 'gasolina'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                >
                  <FiDroplet className="mr-2 h-5 w-5" />
                  <div className="font-semibold">Gasolina</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoCombustible('gasoil')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${tipoCombustible === 'gasoil'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                >
                  <FiTruck className="mr-2 h-5 w-5" />
                  <div className="font-semibold">Gasoil</div>
                </button>
              </div>
            </div>
          )}

          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-300">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📅 <strong>Nuevo Sistema:</strong> Los retiros se agendan para el día siguiente.
              El administrador procesará tu solicitud a las 5:00 AM.
            </p>
          </div>
          <form onSubmit={handleAgendar} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="litros" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad de Litros
              </label>
              <input
                type="number"
                id="litros"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
                placeholder={estadoInventario?.disponible ? "Ingrese cantidad" : "Sin inventario disponible"}
                min="1"
                max={tipoCombustible === 'gasolina'
                  ? (cliente?.litros_disponibles_gasolina ?? cliente?.litros_disponibles ?? 0)
                  : (cliente?.litros_disponibles_gasoil ?? cliente?.litros_disponibles ?? 0)
                }
                disabled={!estadoInventario?.disponible || (estadoInventario?.inventario?.[tipoCombustible] || 0) <= 0 || isLoading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={isLoading || !estadoInventario?.disponible || (estadoInventario?.inventario?.[tipoCombustible] || 0) <= 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(estadoInventario?.inventario?.[tipoCombustible] || 0) <= 0
                  ? `🚫 Sin ${tipoCombustible} Disponible`
                  : !estadoInventario?.disponible
                    ? '⚠️ Sistema No Disponible'
                    : isLoading
                      ? '🔄 Agendando...'
                      : `📅 Agendar ${tipoCombustible} para Mañana`
                }
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!litros || isNaN(Number(litros)) || Number(litros) <= 0) {
                    toast.error('Por favor ingrese una cantidad válida para la prueba');
                    return;
                  }

                  try {
                    console.log('🧪 Probando endpoint de prueba...');
                    const response = await api.post('/api/test-agendamiento', {
                      cliente_id: cliente?.id || 1,
                      tipo_combustible: tipoCombustible,
                      litros: parseFloat(litros)
                    });

                    console.log('🧪 Respuesta de prueba:', response.data);

                    // Mostrar modal con datos de prueba
                    const ticketInfo = {
                      codigo_ticket: response.data.codigo_ticket,
                      fecha_agendada: response.data.fecha_agendada,
                      litros: parseFloat(litros),
                      tipo_combustible: tipoCombustible,
                      cliente: {
                        nombre: cliente?.nombre || 'Cliente de Prueba',
                        cedula: cliente?.cedula || '12345678',
                        telefono: cliente?.telefono || '0412-123-4567',
                        placa: cliente?.placa || 'ABC-123',
                        categoria: cliente?.categoria || 'Empleado'
                      }
                    };

                    setTicketData(ticketInfo);
                    setShowTicketModal(true);
                  } catch (error: any) {
                    console.error('🧪 Error en prueba:', error);
                    toast.error('Error en prueba: ' + (error.response?.data?.error || error.message));
                  }
                }}
                className="w-full flex justify-center py-2 px-4 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
              >
                🧪 Prueba Ticket
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2" />
              <span className="text-gray-700">
                <span className="font-medium">Nombre:</span> {cliente.nombre}
              </span>
            </div>
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2 opacity-0" />
              <span className="text-gray-700">
                <span className="font-medium">Cédula:</span> {cliente.cedula}
              </span>
            </div>
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2 opacity-0" />
              <span className="text-gray-700">
                <span className="font-medium">Categoría:</span> {cliente.categoria}
              </span>
            </div>
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2 opacity-0" />
              <span className="text-gray-700">
                <span className="font-medium">Teléfono:</span> {cliente.telefono}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Mis Agendamientos</h2>

        {agendamientos.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay agendamientos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Cuando agendes un retiro, aparecerá aquí con su número de ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendamientos.map((agendamiento: any) => (
              <div key={agendamiento.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                          #{agendamiento.codigo_ticket?.toString().padStart(3, '0') || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {agendamiento.litros}L de {agendamiento.tipo_combustible}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        📅 Fecha: {new Date(agendamiento.fecha_agendada).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        🕐 Creado: {new Date(agendamiento.fecha_creacion).toLocaleDateString('es-ES')} a las {new Date(agendamiento.fecha_creacion).toLocaleTimeString('es-ES')}
                      </p>
                      {agendamiento.subcliente_nombre && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          👷 Trabajador: {agendamiento.subcliente_nombre}
                          {agendamiento.subcliente_cedula ? ` · CI: ${agendamiento.subcliente_cedula}` : ''}
                          {agendamiento.subcliente_placa ? ` · Placa: ${agendamiento.subcliente_placa}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${agendamiento.estado === 'procesado'
                      ? 'bg-green-100 text-green-800'
                      : agendamiento.estado === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {agendamiento.estado === 'procesado' ? '✅ Procesado' :
                        agendamiento.estado === 'pendiente' ? '⏳ Pendiente' : '❌ Cancelado'}
                    </span>
                    {agendamiento.estado === 'pendiente' && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        💡 Lleva tu ticket mañana
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal del Ticket */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        ticketData={ticketData}
      />

      {/* Modal de Inventario Agotado */}
      <InventarioAgotadoModal
        isOpen={showInventarioAgotado}
        onClose={() => setShowInventarioAgotado(false)}
        tipoCombustible={tipoCombustibleAgotado}
      />

      {/* Modal para agregar subcliente */}
      {esInstitucional && (
        <SubclienteFormModal
          isOpen={showSubclienteModal}
          onClose={() => setShowSubclienteModal(false)}
          onSubclienteCreado={() => {
            refetchSubclientes();
            toast.success('Trabajador registrado exitosamente');
          }}
          clientePadreId={cliente?.id || 0}
          litrosDisponiblesGasolina={litrosDisponiblesParaSubGasolina}
          litrosDisponiblesGasoil={litrosDisponiblesParaSubGasoil}
        />
      )}
    </div>
  );
}
