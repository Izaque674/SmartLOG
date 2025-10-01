// ...existing code...
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { FiSearch, FiCopy, FiX, FiMapPin } from 'react-icons/fi';

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
  
  const markerRef = useRef(null);

  useEffect(() => {
    if (!markerPosition) return;
    const fetchAddress = async () => {
      try {
        const [lat, lng] = markerPosition;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) setMarkerText(data.display_name);
        else setMarkerText("Endereço não encontrado para esta localização.");
      } catch (error) {
        console.error("Erro na geocodificação reversa:", error);
        setMarkerText("Não foi possível buscar o endereço.");
      }
    };
    fetchAddress();
  }, [markerPosition]);

  useEffect(() => {
    if (markerText && markerRef.current) markerRef.current.openPopup();
  }, [markerText]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        setMarkerPosition(newPos);
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

  const handleCopyAddress = () => {
    if (!markerText) return;
    navigator.clipboard.writeText(markerText);
    alert("Endereço copiado!");
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
      <div className="p-3 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <FiMapPin className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Buscador de Endereços</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 -mt-0.5">Clique no mapa ou pesquise um endereço</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rua, número, cidade..."
              className="h-9 w-56 sm:w-64 md:w-72 px-3 pr-10 text-sm rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1"
                aria-label="Limpar"
              >
                <FiX />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              aria-label="Pesquisar"
            >
              {isSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSearch />}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-grow relative" style={{ minHeight: 320 }}>
        <MapContainer
          center={position}
          zoom={zoom}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
        >
          <ChangeView center={position} zoom={zoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapClickHandler setPosition={setMarkerPosition} />

          {markerPosition && (
            <Marker position={markerPosition} ref={markerRef}>
              <Popup>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <span className="text-sm text-gray-800 dark:text-slate-200">{markerText || 'Carregando...'}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs font-semibold rounded-md hover:bg-indigo-200"
                    >
                      <FiCopy /> Copiar
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${markerPosition[0]}, ${markerPosition[1]}`); alert('Coordenadas copiadas'); }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded-md hover:bg-gray-200"
                    >
                      Coordenadas
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* pequena instrução flutuante */}
        <div className="absolute left-4 bottom-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-xs text-gray-700 dark:text-slate-200 flex items-center gap-2 border border-gray-100 dark:border-slate-700">
          <FiMapPin className="w-4 h-4 text-indigo-600" />
          Clique no mapa para marcar um local
        </div>
      </div>
    </div>
  );
}

export default BlocoMapaBuscaOpenSource;
