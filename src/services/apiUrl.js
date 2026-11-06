/**
 * Descobre o endereço da API (backend) e explica falhas de conexão.
 * Sem dependências do navegador, para poder ser testado.
 */

// Endereço do backend publicado na Vercel. Só é usado quando a variável
// VITE_API_BASE_URL não está configurada (ou aponta para o computador local
// dentro do site publicado).
export const PRODUCTION_API_URL = "https://rota-brasil-backend.vercel.app/api";
export const LOCAL_API_URL = "http://localhost:3333/api";

function isLocalAddress(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url);
}

/**
 * configured: valor de VITE_API_BASE_URL (pode estar vazio)
 * isDev:      true no "npm run dev"
 * hostname:   endereço em que o jogo está aberto (ex.: "localhost")
 */
export function resolveApiBaseUrl(configured, { isDev = false, hostname = "" } = {}) {
  let url = String(configured || "").trim().replace(/\/+$/, "");

  const onThisComputer =
    isDev || hostname === "localhost" || hostname === "127.0.0.1";

  // Site publicado apontando para "localhost" nunca funciona para o jogador:
  // usa o backend publicado.
  if (!url || (!onThisComputer && isLocalAddress(url))) {
    url = onThisComputer ? LOCAL_API_URL : PRODUCTION_API_URL;
  }

  // Erro comum ao colar na Vercel: esquecer o "/api" no final.
  if (!/\/api$/i.test(url)) {
    url += "/api";
  }

  return url;
}

/** Frase curta com o motivo provável da falha (para a área "Detalhes técnicos"). */
export function describeApiError(error) {
  if (!error) {
    return "";
  }

  if (error.status) {
    return `O servidor respondeu com erro ${error.status}: ${error.message}`;
  }

  if (/demorou/i.test(String(error.message))) {
    return String(error.message);
  }

  return "Sem resposta do servidor. Causas comuns: endereço da API errado, servidor fora do ar ou bloqueio de CORS (o site não está na lista de origens permitidas do backend).";
}