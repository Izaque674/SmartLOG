// src/components/ConfirmacaoModal.jsx

import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

function ConfirmacaoModal({ titulo, mensagem, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6">{mensagem}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmacaoModal;