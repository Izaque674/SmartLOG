// Este arquivo conterá toda a nossa lógica de negócios.

// Define os limites para cada status em KM.
const LIMITE_ATENCAO_KM = 3000;
const LIMITE_ATRASADO_KM = 0;

/**
 * Calcula o status de um único item de manutenção.
 * @param {object} item - O item de manutenção.
 * @param {number} km_atual - A quilometragem atual do veículo.
 * @returns {object} - Um objeto com o status, km da próxima revisão e km restantes.
 */
function calcularStatusItem(item, km_atual) {
  const kmProximaRevisao = item.km_ultima_revisao + item.intervalo_km;
  const kmRestantes = kmProximaRevisao - km_atual;

  let status;
  if (kmRestantes <= LIMITE_ATRASADO_KM) {
    status = 'Atrasado';
  } else if (kmRestantes <= LIMITE_ATENCAO_KM) {
    status = 'Atenção';
  } else {
    status = 'Em dia';
  }

  return { status, kmProximaRevisao, kmRestantes };
}

/**
 * Processa um veículo inteiro, calculando o status de cada item
 * e determinando o status geral e o item mais urgente.
 * @param {object} veiculo - O objeto do veículo.
 * @returns {object} - O objeto do veículo enriquecido com informações de status.
 */
export function processarVeiculo(veiculo) {
  let statusGeral = 'Em dia';
  let itemMaisUrgente = null;
  let menorKmRestante = Infinity;

  const itensProcessados = veiculo.itensDeManutencao.map(item => {
    const infoStatus = calcularStatusItem(item, veiculo.km_atual);

    // Lógica para determinar o status geral e o item mais urgente
    if (infoStatus.kmRestantes < menorKmRestante) {
      menorKmRestante = infoStatus.kmRestantes;
      itemMaisUrgente = { ...item, ...infoStatus };
    }

    return { ...item, ...infoStatus };
  });

  if (itemMaisUrgente) {
    statusGeral = itemMaisUrgente.status;
  }
  
  return {
    ...veiculo,
    itensDeManutencao: itensProcessados,
    statusGeral,
    itemMaisUrgente,
  };
}