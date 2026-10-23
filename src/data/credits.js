// ARQUIVO: src/data/credits.js  (SUBSTITUIR o conteúdo inteiro)
/**
 * Conteúdo da tela de Créditos.
 * Para mudar integrantes, agradecimentos ou fontes, edite SÓ este arquivo.
 *
 * Seções sem itens (lista vazia) não aparecem na tela.
 */

export const CREDITS_TITLE = "Rota Brasil: A Expedição de Aê";

export const CREDITS_INTRO =
  "Jogo educativo de Geografia para crianças, feito para aprender " +
  "brincando e para ser acessível a todos.";

/**
 * Instituição de ensino.
 * logo: caminho de uma imagem dentro de "public". O caminho começa em
 *       "/" e NÃO inclui a palavra "public". Use SOMENTE o arquivo oficial,
 *       com autorização da instituição. Se o arquivo não existir (ou com
 *       logo: null), só o nome aparece.
 * logoTrim: true corta as margens brancas da imagem e deixa o logo bem
 *       maior (serve para a imagem quadrada com muito espaço em volta).
 *       Se você já recortou a imagem rente ao logo, use false.
 */
export const UNIVERSITY = {
  name: "Universidade Cruzeiro do Sul",
  short: "UNICSUL",
  description: "Projeto desenvolvido por estudantes da Universidade Cruzeiro do Sul.",
  logo: "/assets/audio/credits/unicsul-logo.png",
  logoTrim: true
};

/** Mude para false para esconder os RGM de todos (a tela é pública). */
export const SHOW_RGM = true;

export const TEAM = [
  { name: "Cláudio Sérgio de Oliveira Neto", rgm: "43408851" },
  { name: "Diego Alves Salaguasta", rgm: "04606213" },
  { name: "Kaue Araujo da Silva", rgm: "04292326" },
  { name: "Luis Henrique Barbosa Silva", rgm: "42467764" },
  { name: "Pablo Almeida Neves", rgm: "04759247" },
  { name: "Ygor Silva Souza", rgm: "42439043" }
];

export const CREDITS_SECTIONS = [
  {
    id: "educacao",
    title: "Base educativa",
    items: [
      {
        role: "Geografia",
        name: "BNCC — Base Nacional Comum Curricular"
      },
      {
        role: "Cores da reciclagem (Fase 4)",
        name: "Resolução CONAMA nº 275/2001"
      }
    ]
  },
  {
    id: "tecnologia",
    title: "Tecnologias",
    items: [
      { role: "Telas e jogo", name: "React e Vite" },
      { role: "Servidor", name: "Node.js e Express" },
      { role: "Banco de dados", name: "Supabase" },
      { role: "Publicação", name: "Vercel" }
    ]
  },
  {
    id: "fontes",
    title: "Fontes de letra",
    items: [
      { role: "Texto do jogo", name: "Fredoka (licença SIL Open Font)" },
      { role: "Opção para dislexia", name: "OpenDyslexic (fonte livre)" }
    ]
  },
  {
    id: "midia",
    title: "Sons e imagens",
    // Quando incluir sons de animais (ex.: Xeno-canto, Freesound), liste aqui
    // o autor e a licença de cada um. Exemplo:
    // { role: "Canto do sabiá", name: "Fulano — CC BY 4.0 (xeno-canto.org)" }
    items: []
  }
];