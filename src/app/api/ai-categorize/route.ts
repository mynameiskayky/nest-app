import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content: `Você é um analista de dados, trabalhando em um projeto de limpeza de dados financeiros.
Seu trabalho é melhorar o título da transação e escolher uma categoria adequada para cada lançamento financeiro.

Melhore o título:
- Remova informações desnecessárias como números de referência ou códigos
- Mantenha informações relevantes sobre o estabelecimento ou natureza da transação
- Capitalize adequadamente

Escolha uma categoria dentre as seguintes:
- Alimentação
- Receitas
- Saúde
- Mercado
- Educação
- Compras
- Transporte
- Investimento
- Transferências para terceiros
- Telefone
- Moradia

Ou crie uma categoria personalizada se não couber em nenhuma das categorias disponíveis.

Responda com um objeto JSON contendo 'improvedTitle' e 'category'.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
