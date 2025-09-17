import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext, API_URL } from '../context/AppContext.jsx';
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiXCircle, FiTruck, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import ConfirmacaoModal from '../components/ConfirmacaoModal.jsx'; // Importa o modal de confirmação

// --- Componente para a linha do histórico ATUALIZADO com novo design ---
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
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out hover:scale-[1.005] hover:border-indigo-400 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-indigo-600"
    >
      <div className="flex items-center space-x-4">
        <FiCalendar className="text-indigo-500 flex-shrink-0" size={28} /> {/* Ícone maior e com cor principal */}
        <div>
          <p className="font-bold text-lg text-gray-900 dark:text-white">Jornada de {dataFimFormatada}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-slate-400 mt-1">
            <span className="flex items-center font-medium"><FiTruck className="mr-1.5 text-gray-500 dark:text-slate-500" />{resumo.totalEntregas || 0} Entregas</span>
            <span className="flex items-center font-medium text-green-600 dark:text-green-400"><FiCheckCircle className="mr-1.5" />{resumo.concluidas || 0} Sucessos</span>
            <span className="flex items-center font-medium text-red-600 dark:text-red-400"><FiXCircle className="mr-1.5" />{resumo.falhas || 0} Falhas</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* Botão de Excluir */}
        <button
          onClick={handleDeleteClick}
          className="group p-2 text-gray-400 transition-colors duration-200 hover:bg-red-100 hover:text-red-600 rounded-full dark:hover:bg-red-900/40 dark:hover:text-red-300"
          title="Excluir esta jornada"
        >
          <FiTrash2 size={18} />
        </button>
        <FiChevronRight className="text-gray-400 dark:text-slate-500" size={24} /> {/* Ícone maior */}
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
    return (
      <div className="flex min-h-screen items-center justify-center p-8 dark:bg-slate-900">
        <p className="text-gray-700 dark:text-slate-300">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60">
        <div className="mx-auto flex max-w-7xl items-center space-x-4">
          <Link to="/entregas/controle" className="rounded-full p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700">
            <FiArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Histórico de Jornadas</h1>
        </div>
      </header>
      <main className="p-6 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-4">
          {historico.length > 0 ? (
            historico.map(jornada =>
              <JornadaRow
                key={jornada.id}
                jornada={jornada}
                onDelete={(j) => setJornadaParaExcluir(j)} // Define qual jornada será excluída
              />)
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60">
              <p className="mb-4 text-lg font-medium text-gray-600 dark:text-slate-400">Nenhuma jornada finalizada encontrada no histórico.</p>
              <Link
                to="/entregas/controle"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-white shadow-md transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <FiTruck className="h-5 w-5" />
                <span className="font-medium">Iniciar Nova Jornada</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Modal de confirmação para a exclusão */}
      {jornadaParaExcluir && (
        <ConfirmacaoModal
          titulo="Excluir Registro de Jornada"
          mensagem={`Tem certeza que deseja excluir permanentemente o registro da jornada de ${new Date(jornadaParaExcluir.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}? As entregas associadas a esta jornada não serão removidas.`}
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