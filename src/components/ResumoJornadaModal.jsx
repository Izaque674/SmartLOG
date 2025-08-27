import React from 'react';
import { Link } from 'react-router-dom'; // 1. Importar o Link
import { FiX, FiCheckCircle, FiXCircle, FiClipboard, FiArrowRight } from 'react-icons/fi';

// 2. O modal agora precisa do ID da jornada para criar o link
function ResumoJornadaModal({ resumo, jornadaId, onClose }) {
  if (!resumo || !jornadaId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-slide-up">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FiX size={24} />
        </button>

        <div className="p-6 text-center">
          <FiClipboard size={40} className="mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Resumo do Dia</h2>
          <p className="text-gray-500 mt-2">A jornada foi finalizada. Aqui estão os resultados:</p>

          <div className="mt-6 text-left space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total de Entregas:</span>
              <span className="font-bold text-lg text-gray-900">{resumo.totalEntregas}</span>
            </div>
            <div className="flex justify-between items-center text-green-600">
              <span className="font-semibold">Concluídas:</span>
              <span className="font-bold text-lg flex items-center"><FiCheckCircle className="mr-1" /> {resumo.concluidas}</span>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span className="font-semibold">Falhas:</span>
              <span className="font-bold text-lg flex items-center"><FiXCircle className="mr-1" /> {resumo.falhas}</span>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-800">Taxa de Sucesso</p>
            <p className="text-3xl font-bold text-blue-600">{resumo.taxaSucesso}%</p>
          </div>
        </div>

        {/* 3. Rodapé atualizado com o novo botão */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg border-t">
          <button 
            onClick={onClose} 
            className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-700"
          >
            Fechar
          </button>
          <Link
            to={`/entregas/jornada/${jornadaId}`}
            onClick={onClose} // Fecha o modal ao navegar
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>Ver Detalhes</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResumoJornadaModal;