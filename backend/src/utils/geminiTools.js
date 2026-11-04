const { Type } = require('@google/genai');

/**
 * Declaração das 3 ferramentas (Function Calling) para o Google Gemini
 * Essas declarações explicam para a IA quais funções existem no backend
 * e quais parâmetros cada uma aceita.
 */
const geminiTools = [
  {
    name: 'listarClientes',
    description:
      'Lista os clientes cadastrados pelo vendedor autenticado. Pode filtrar opcionalmente por nome, situação comercial ou potencial de compra.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        nome: {
          type: Type.STRING,
          description: 'Trecho do nome fantasia ou razão social da empresa.',
        },
        situacaoComercial: {
          type: Type.STRING,
          description:
            'Situação da prospecção: Novo, Em prospecção, Em negociação, Convertido ou Descartado.',
        },
        potencialCompra: {
          type: Type.STRING,
          description: 'Potencial de compra estimado: Baixo, Médio ou Alto.',
        },
      },
    },
  },
  {
    name: 'consultarCliente',
    description:
      'Consulta todos os dados comerciais detalhados de um cliente específico (por ID, nome ou CNPJ).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        identificador: {
          type: Type.STRING,
          description: 'ID do cliente, CNPJ, razão social ou nome fantasia.',
        },
      },
      required: ['identificador'],
    },
  },
  {
    name: 'analisarOportunidades',
    description:
      'Analisa os clientes do vendedor com critérios objetivos (potencial de compra, score manual e dias desde a última interação) para recomendar quais oportunidades priorizar.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

module.exports = geminiTools;

