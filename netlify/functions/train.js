const sigmoid = (x) => 1 / (1 + Math.exp(-x));

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { treinamento, mensagemTeste } = JSON.parse(event.body);

    // 1. Tokenização Raiz
    const palavrasChave = [...new Set(treinamento.flatMap(t => t.frase.toLowerCase().split(' ')))];
    const vetorizar = (frase) => palavrasChave.map(p => frase.toLowerCase().includes(p) ? 1 : 0);

    // 2. Treinamento (Pesos)
    let pesos = {};
    treinamento.forEach(exemplo => {
        const vetor = vetorizar(exemplo.frase);
        if (!pesos[exemplo.categoria]) pesos[exemplo.categoria] = new Array(palavrasChave.length).fill(0);
        vetor.forEach((bit, i) => { if (bit === 1) pesos[exemplo.categoria][i] += 1; });
    });

    // 3. Inferência
    const vetorEntrada = vetorizar(mensagemTeste);
    let melhorCategoria = "Desconhecido";
    let maiorPontuacao = -Infinity;

    Object.keys(pesos).forEach(cat => {
        const pontuacao = vetorEntrada.reduce((acc, bit, i) => acc + (bit * pesos[cat][i]), 0);
        const probabilidade = sigmoid(pontuacao);
        if (probabilidade > maiorPontuacao) {
            maiorPontuacao = probabilidade;
            melhorCategoria = cat;
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            intencao: melhorCategoria, 
            confianca: (maiorPontuacao * 100).toFixed(2) + "%" 
        })
    };
};
