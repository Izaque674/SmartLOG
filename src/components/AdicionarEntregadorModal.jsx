import React, { useState } from 'react';
import { storage } from '../firebase-config'; // Importe o storage do seu arquivo de configuração do Firebase
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FiUploadCloud } from 'react-icons/fi';

// O nome da função permanece o mesmo que você já tem
function AdicionarEntregadorModal({ onClose, onSave, entregadorExistente }) {
  // --- STATES DO COMPONENTE ---
  const [formData, setFormData] = useState({
    nome: entregadorExistente?.nome || '',
    telefone: entregadorExistente?.telefone || '',
    veiculo: entregadorExistente?.veiculo || '',
    rota: entregadorExistente?.rota || '',
  });

  const [imageFile, setImageFile] = useState(null); // Guarda o NOVO arquivo de imagem que o usuário selecionou
  const [previewUrl, setPreviewUrl] = useState(entregadorExistente?.fotoUrl || null); // URL para mostrar a imagem de preview
  
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0); // Para a barra de progresso do upload

  // --- FUNÇÕES DE LÓGICA ---

  // Atualiza o state 'formData' quando o usuário digita nos campos de texto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Chamada quando o usuário seleciona um arquivo de imagem
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Guarda o arquivo para o futuro upload
      setPreviewUrl(URL.createObjectURL(file)); // Gera um link local para o preview instantâneo na tela
    }
  };

  // Função principal chamada quando o formulário é enviado (clique no botão "Salvar")
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // CASO 1: O usuário selecionou uma NOVA imagem para upload.
    if (imageFile) {
      // Cria uma referência única para o arquivo (pasta/timestamp_nomearquivo)
      const storageRef = ref(storage, `avatars_entregadores/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      // Acompanha o progresso do upload em tempo real
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Atualiza a barra de progresso
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(prog);
        },
        (error) => {
          // Se der erro no upload
          console.error("Erro no upload da imagem:", error);
          setIsSaving(false);
          alert("Falha ao salvar a imagem. Por favor, tente novamente.");
        },
        () => {
          // Upload concluído com sucesso!
          // Pega a URL de download final do arquivo no Firebase
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // Chama a função 'onSave' do componente pai, passando todos os dados do formulário
            // E a NOVA URL da imagem que acabamos de subir.
            onSave({ ...formData, fotoUrl: downloadURL });
          });
        }
      );
    } 
    // CASO 2: O usuário NÃO selecionou uma nova imagem.
    else {
      // Apenas chama a função 'onSave', passando os dados do formulário
      // e mantendo a URL da foto antiga que já existia (ou nulo se não existia).
      onSave({ ...formData, fotoUrl: entregadorExistente?.fotoUrl || null });
    }
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          {entregadorExistente ? 'Editar Entregador' : 'Adicionar Novo Entregador'}
        </h2>
        <form onSubmit={handleSubmit}>
          
          {/* Componente visual para o Upload da Imagem */}
          <div className="flex flex-col items-center mb-6">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-700">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar do Entregador" className="w-full h-full object-cover" />
                ) : (
                  <FiUploadCloud className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </label>
            <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Clique na imagem para alterar</p>
          </div>
          {/* Fim do componente visual da imagem */}

          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome</label>
              <input type="text" name="nome" id="nome" value={formData.nome} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Telefone</label>
              <input type="text" name="telefone" id="telefone" value={formData.telefone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="veiculo" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Veículo</label>
              <input type="text" name="veiculo" id="veiculo" value={formData.veiculo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="rota" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Rota Principal</label>
              <input type="text" name="rota" id="rota" value={formData.rota} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          {/* Barra de Progresso do Upload (só aparece quando está enviando uma imagem) */}
          {isSaving && imageFile && (
            <div className="mt-4">
                <div className="text-center text-sm text-gray-500 dark:text-slate-400 mb-1">Enviando imagem... {progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdicionarEntregadorModal;