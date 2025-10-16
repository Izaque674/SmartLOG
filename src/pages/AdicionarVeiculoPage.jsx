import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiArrowLeft, FiCamera } from 'react-icons/fi';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, storage } from '../firebase-config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Componente para adicionar itens de manutenção
function ItemManutencaoInput({ onAddItem }) {
  const [nome, setNome] = useState('');
  const [intervalo, setIntervalo] = useState('');

  const handleAddItem = () => {
    if (!nome || !intervalo) {
      toast.error('Preencha o nome do serviço e o intervalo em KM.');
      return;
    }
    onAddItem({
      id: `item-${Date.now()}`,
      nome,
      intervalo_km: parseInt(intervalo, 10),
      km_ultima_revisao: 0
    });
    setNome('');
    setIntervalo('');
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="itemNome" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          Nome do Serviço
        </label>
        <input
          id="itemNome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Troca de Óleo"
          className="mt-1 w-full rounded-md border-gray-300 bg-white text-sm shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400"
        />
      </div>
      <div className="flex-1 sm:max-w-xs">
        <label htmlFor="itemIntervalo" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          Intervalo (em KM)
        </label>
        <input
          id="itemIntervalo"
          type="number"
          value={intervalo}
          onChange={(e) => setIntervalo(e.target.value)}
          placeholder="Ex: 10000"
          className="mt-1 w-full rounded-md border-gray-300 bg-white text-sm shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400"
        />
      </div>
      <button
        type="button"
        onClick={handleAddItem}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
      >
        <FiPlus />
        <span>Adicionar</span>
      </button>
    </div>
  );
}

// Componente para a linha de um item de manutenção já adicionado
function ItemAdicionadoRow({ item, onRemove }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
      <p className="font-medium text-blue-800 dark:text-blue-200">
        {item.nome} - <span className="font-normal text-blue-600 dark:text-blue-300">a cada {item.intervalo_km.toLocaleString('pt-BR')} km</span>
      </p>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
        title="Remover item"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// --- Componente Principal da Página ---
function AdicionarVeiculoPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [veiculo, setVeiculo] = useState({
    placa: '',
    modelo: '',
    ano: '',
    km_atual: ''
  });
  const [itensManutencao, setItensManutencao] = useState([]);

  // States para a imagem
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVeiculo((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddItem = (novoItem) => {
    const kmInicial = parseInt(veiculo.km_atual, 10) || 0;
    setItensManutencao((prevState) => [...prevState, { ...novoItem, km_ultima_revisao: kmInicial }]);
  };

  const handleRemoveItem = (itemId) => {
    setItensManutencao((prevState) => prevState.filter((item) => item.id !== itemId));
  };

  // Função para lidar com a seleção da imagem
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Erro: Você não está autenticado.');
      navigate('/login');
      return;
    }
    if (itensManutencao.length === 0) {
      toast.error('Adicione pelo menos um item de manutenção ao plano.');
      return;
    }

    setIsLoading(true);

    // Função interna para salvar os dados no Firestore, com ou sem a URL da foto
    const saveData = async (fotoUrl = null) => {
      const novoVeiculoParaSalvar = {
        placa: veiculo.placa.toUpperCase(),
        modelo: veiculo.modelo,
        ano: parseInt(veiculo.ano, 10),
        km_atual: parseInt(veiculo.km_atual, 10),
        itensDeManutencao: itensManutencao,
        userId: auth.currentUser.uid,
        fotoUrl // Adiciona a URL da foto
      };

      try {
        await addDoc(collection(db, 'veiculos'), novoVeiculoParaSalvar);
        toast.success('Veículo adicionado com sucesso!');
        navigate('/manutencao/dashboard');
      } catch (error) {
        console.error('Erro ao adicionar veículo:', error);
        toast.error('Falha ao salvar o veículo. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    // Lógica de upload antes de salvar
    if (imageFile) {
      const storageRef = ref(storage, `fotos_veiculos/${Date.now()}_${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        (error) => {
          console.error('Erro no upload:', error);
          setIsLoading(false);
          toast.error('Falha ao salvar a imagem do veículo.');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            saveData(downloadURL); // Chama a função de salvar com a URL da imagem
          });
        }
      );
    } else {
      saveData(); // Chama a função de salvar sem URL de imagem
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link
            to="/manutencao/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <FiArrowLeft className="h-4 w-4" />
            Voltar para o Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Informações do Veículo</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-center mb-2 dark:text-slate-300">Foto do Veículo</label>
                <div className="flex flex-col items-center">
                  <label htmlFor="foto-veiculo-upload" className="cursor-pointer">
                    <div className="w-48 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-700">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview do Veículo" className="w-full h-full object-cover" />
                      ) : (
                        <FiCamera className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                  </label>
                  <input id="foto-veiculo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="placa" className="block text-sm font-medium dark:text-slate-300">Placa</label>
                  <input
                    id="placa"
                    name="placa"
                    value={veiculo.placa}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label htmlFor="modelo" className="block text-sm font-medium dark:text-slate-300">Modelo</label>
                  <input
                    id="modelo"
                    name="modelo"
                    value={veiculo.modelo}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label htmlFor="ano" className="block text-sm font-medium dark:text-slate-300">Ano</label>
                  <input
                    id="ano"
                    name="ano"
                    type="number"
                    value={veiculo.ano}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label htmlFor="km_atual" className="block text-sm font-medium dark:text-slate-300">KM Inicial</label>
                  <input
                    id="km_atual"
                    name="km_atual"
                    type="number"
                    value={veiculo.km_atual}
                    onChange={handleInputChange}
                    required
                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plano de Manutenção Preventiva</h2>
            <div className="mt-4 space-y-3">
              {itensManutencao.map((item) => (
                <ItemAdicionadoRow key={item.id} item={item} onRemove={() => handleRemoveItem(item.id)} />
              ))}
              {itensManutencao.length === 0 && (
                <p className="text-center text-sm text-gray-500 dark:text-slate-400">Nenhum item adicionado ainda.</p>
              )}
            </div>
            <div className="mt-4">
              <ItemManutencaoInput onAddItem={handleAddItem} />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-8 py-3 font-bold text-white shadow-sm hover:bg-green-700 disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading ? `Salvando... ${progress > 0 ? progress + '%' : ''}` : 'Salvar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdicionarVeiculoPage;
