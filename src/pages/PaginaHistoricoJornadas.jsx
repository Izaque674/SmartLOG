import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiXCircle, FiTruck, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx'; // Importa o modal de confirmação

// --- Componente para a linha do histórico ATUALIZADO ---
function JornadaRow({ jornada, onDelete }) {
  const dataFimFormatada = new Date(jornada.dataFim).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const resumo = jornada.resumo || {};

  // Impede o link de ser acionado quando o botão de lixeira é clicado
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(jornada);
  };

  return (
    <Link 
      to={`/entregas/jornada/${jornada.id}`} 
      className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 border border-transparent transition-all"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FiCalendar className="text-blue-500" size={24} />
          <div>
            <p className="font-bold text-lg text-gray-800">Jornada de {dataFimFormatada}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center"><FiTruck className="mr-1.5" />{resumo.totalEntregas || 0} Entregas</span>
              <span className="flex items-center text-green-600"><FiCheckCircle className="mr-1.5" />{resumo.concluidas || 0} Sucessos</span>
              <span className="flex items-center text-red-600"><FiXCircle className="mr-1.5" />{resumo.falhas || 0} Falhas</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Botão de Excluir */}
          <button 
            onClick={handleDeleteClick}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"
            title="Excluir esta jornada"
          >
            <FiTrash2 size={18} />
          </button>
          <FiChevronRight className="text-gray-400" size={20} />
        </div>
      </div>
    </Link>
  );
}

function PaginaHistoricoJornadas() {
  const { user } = useAppContext();
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jornadaParaExcluir, setJornadaParaExcluir] = useState(null);

  const fetchHistorico = async () => {
    try {
      const response = await fetch(`${API_URL}/jornadas/historico/${user.uid}`);
      if (!response.ok) throw new Error('Falha ao buscar histórico');
      const data = await response.json();
      setHistorico(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistorico();
    }
  }, [user]);

  const handleDeleteJornada = async () => {
    if (!jornadaParaExcluir) return;
    try {
      const response = await fetch(`${API_URL}/jornadas/${jornadaParaExcluir.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao deletar jornada');

      // Após deletar, atualiza a lista de histórico
      await fetchHistorico();
      
    } catch (error) {
      console.error("Erro ao deletar jornada:", error);
      alert("Não foi possível deletar o registro da jornada.");
    } finally {
      setJornadaParaExcluir(null); // Fecha o modal
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando histórico...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex items-center space-x-4">
        <Link to="/entregas/controle" className="text-gray-500 hover:text-gray-800">
          <FiArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">Histórico de Jornadas</h1>
      </header>
      <main className="p-8">
        <div className="space-y-4">
          {historico.length > 0 ? (
            historico.map(jornada => 
              <JornadaRow 
                key={jornada.id} 
                jornada={jornada}
                onDelete={(j) => setJornadaParaExcluir(j)} // Define qual jornada será excluída
              />)
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">Nenhuma jornada finalizada encontrada no histórico.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmação para a exclusão */}
      {jornadaParaExcluir && (
        <ConfirmacaoModal
          titulo="Excluir Registro de Jornada"
          mensagem={`Tem certeza que deseja excluir permanentemente o registro desta jornada? As entregas associadas não serão removidas.`}
          onConfirm={handleDeleteJornada}
          onCancel={() => setJornadaParaExcluir(null)}
          isDestructive={true}
          confirmText="Sim, Excluir"
        />
      )}
    </div>
  );
}

export default PaginaHistoricoJornadas;