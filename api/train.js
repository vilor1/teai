// Função de Ativação (Sigmoid) - O coração do neurônio
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Use POST');

    const { treinamento, mensagemTeste } = req.body;

    // 1. Tokenização "Raiz"
    const palavrasChave = [...new Set(treinamento.flatMap(t => t.frase.toLowerCase().split(' ')))];
    
    // 2. Vetorização (Transforma frase em 0 e 1)
    const vetorizar = (frase) => palavrasChave.map(p => frase.toLowerCase().includes(p) ? 1 : 0);

    // 3. O "Treinamento" (Ajuste de Pesos Simplificado)
    // Criamos um mapa de pesos para cada categoria baseada nas palavras
    let pesos = {};
    treinamento.forEach(exemplo => {
        const vetor = vetorizar(exemplo.frase);
        if (!pesos[exemplo.categoria]) pesos[exemplo.categoria] = new Array(palavrasChave.length).fill(0);
        
        vetor.forEach((bit, i) => {
            if (bit === 1) pesos[exemplo.categoria][i] += 1; // Fortalece a conexão
        });
    });

    // 4. Teste (Inferência)
    const vetorEntrada = vetorizar(mensagemTeste);
    let melhorCategoria = "Não entendi";
    let maiorPontuacao = -Infinity;

    Object.keys(pesos).forEach(cat => {
        // Produto Escalar (Math puro)
        const pontuacao = vetorEntrada.reduce((acc, bit, i) => acc + (bit * pesos[cat][i]), 0);
        const probabilidade = sigmoid(pontuacao);

        if (probabilidade > maiorPontuacao) {
            maiorPontuacao = probabilidade;
            melhorCategoria = cat;
        }
    });

    res.status(200).json({ 
        intencao: melhorCategoria, 
        confianca: (maiorPontuacao * 100).toFixed(2) + "%" 
    });
}
