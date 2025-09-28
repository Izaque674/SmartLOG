// src/components/BlocoMapaBuscaOpenSource.jsx

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { FiSearch, FiCopy } from 'react-icons/fi';

// Componente interno para mover o mapa programaticamente (sem alterações)
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// #MUDANÇA: Novo componente para capturar os cliques no mapa
function MapClickHandler({ setPosition }) {
  const map = useMapEvents({
    click(e) {
      // Quando o mapa é clicado, chama a função 'setPosition' do componente pai
      // com as coordenadas do clique.
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}


function BlocoMapaBuscaOpenSource() {
  const [position, setPosition] = useState([-23.5505, -46.6333]);
  const [zoom, setZoom] = useState(12);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [markerText, setMarkerText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Ref para o marcador, para podermos abrir o popup programaticamente
  const markerRef = useRef(null);

  // #MUDANÇA: useEffect para fazer a geocodificação reversa quando um marcador é colocado
  useEffect(() => {
    if (!markerPosition) return;
    
    const fetchAddress = async () => {
      try {
        const [lat, lng] = markerPosition;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          setMarkerText(data.display_name);
        } else {
          setMarkerText("Endereço não encontrado para esta localização.");
        }
      } catch (error) {
        console.error("Erro na geocodificação reversa:", error);
        setMarkerText("Não foi possível buscar o endereço.");
      }
    };
    
    fetchAddress();
  }, [markerPosition]); // Roda toda vez que a posição do marcador muda

  // #MUDANÇA: Abrir o popup automaticamente quando o texto dele estiver pronto
  useEffect(() => {
    if (markerText && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [markerText]);


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        setMarkerPosition(newPos); // Atualiza o marcador com o resultado da busca
        setZoom(16);
      } else {
        alert("Endereço não encontrado.");
      }
    } catch (error) {
      console.error("Erro na busca de endereço:", error);
      alert("Ocorreu um erro ao buscar o endereço.");
    } finally {
      setIsSearching(false);
    }
  };

  // #MUDANÇA: Função para copiar o endereço para a área de transferência
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(markerText);
    alert("Endereço copiado!");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Buscador de Endereços</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
           {/* ... (barra de busca sem alterações) ... */}
           <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite um endereço ou clique no mapa..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
           <button type="submit" disabled={isSearching} className="...estilos...">
            {isSearching ? <div className="animate-spin ..."></div> : <FiSearch />}
          </button>
        </form>
      </div>
      <div className="flex-grow bg-gray-200">
        <MapContainer 
          center={position} 
          zoom={zoom} 
          className="w-full h-full z-0"
          scrollWheelZoom={true}
        >
          <ChangeView center={position} zoom={zoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* #MUDANÇA: Adicionamos o handler de clique ao mapa */}
          <MapClickHandler setPosition={setMarkerPosition} />
          
          {markerPosition && (
            <Marker position={markerPosition} ref={markerRef}>
              <Popup>
                <div className="flex flex-col gap-2">
                  <span className="text-sm">{markerText}</span>
                  <button 
                    onClick={handleCopyAddress} 
                    className="flex items-center justify-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md hover:bg-indigo-200"
                  >
                    <FiCopy />
                    Copiar
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default BlocoMapaBuscaOpenSource;