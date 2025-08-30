import { useState, useEffect } from 'react';

// Este hook recebe a data/hora de início e calcula o tempo decorrido a cada segundo.
const useTimer = (startTime) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    if (!startTime) return;

    const startTimestamp = new Date(startTime).getTime();

    const intervalId = setInterval(() => {
      const now = Date.now();
      const difference = now - startTimestamp;

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Formata os números para sempre terem dois dígitos (ex: 01, 02)
      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');
      const formattedSeconds = String(seconds).padStart(2, '0');

      setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    }, 1000); // Atualiza a cada segundo

    // Limpa o intervalo quando o componente é desmontado para evitar vazamento de memória
    return () => clearInterval(intervalId);

  }, [startTime]); // Roda o efeito novamente se a hora de início mudar

  return elapsedTime;
};

export default useTimer;