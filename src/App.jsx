import manutencaoImg from "./assets/manutencao.png";
import entregasImg from "./assets/entregas.png";

export default function App() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Lado Manutenção */}
      <div className="w-1/2 relative cursor-pointer group overflow-hidden">
        {/* Camada da Imagem de Fundo (permanece perfeita) */}
        <img
          src={manutencaoImg}
          alt="Mecânico consertando um carro"
          className="
            absolute inset-0 w-full h-full object-cover
            filter brightness-75 group-hover:brightness-100
            transition-all duration-300
          "
        />

        {/* ======================================= */}
        {/*         O NOVO CARD ESTÁ AQUI           */}
        {/* ======================================= */}
        <div className="relative z-10 flex items-center justify-center h-full">
          {/* O CARD */}
          <div
            className="
              w-3/4 p-8 rounded-xl text-center           {/* Maior, com mais padding, cantos arredondados */}
              bg-white/15 backdrop-blur-md              {/* FUNDO BRANCO OPACO + DESFOQUE */}
              border border-white/20                    {/* Borda sutil */}
              group-hover:bg-white/25                   {/* Fica mais sólido no hover */}
              group-hover:scale-105                     {/* Efeito de crescimento */}
              transition-all duration-300
            "
          >
            {/* TÍTULO */}
            <h2 className="text-gray-900 text-4xl lg:text-5xl font-bold">
              Manutenção
            </h2>
            {/* SUBTÍTULO */}
            <p className="text-gray-800 text-lg mt-2 font-light">
              Gestão completa de frotas, peças e serviços mecânicos.
            </p>
          </div>
        </div>
      </div>

      {/* Lado Entregas (com a mesma estrutura) */}
      <div className="w-1/2 relative cursor-pointer group overflow-hidden">
        {/* Imagem de Fundo */}
        <img
          src={entregasImg}
          alt="Pessoa entregando caixas"
          className="
            absolute inset-0 w-full h-full object-cover
            filter brightness-30 group-hover:brightness-70
            transition-all duration-300
          "
        />
        {/* O CARD */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div
            className="
              w-3/4 p-8 rounded-xl text-center
              bg-white/15 backdrop-blur-md
              border border-white/20
              group-hover:bg-white/50
              group-hover:scale-105
              transition-all duration-300
            "
          >
            {/* TÍTULO */}
            <h2 className="text-gray-900 text-4xl lg:text-5xl font-bold">
              Entregas
            </h2>
            {/* SUBTÍTULO */}
            <p className="text-gray-800 text-lg mt-2 font-light">
              Rastreamento em tempo real, otimização de rotas e logística.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}