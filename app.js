// Lista de textos alternativos considerados genéricos (não descritivos).
// Imagens com esses valores no atributo "alt" serão sinalizadas como aviso.
const GENERIC_ALTS = ['image', 'imagem', 'foto', 'photo', 'logo', 'icon', 'ícone', 'banner'];

// Referências aos elementos HTML que serão manipulados via JavaScript.
const btnAnalyze = document.getElementById('btnAnalyze'); // Botão "Analisar"
const urlInput = document.getElementById('urlInput');     // Campo de texto para a URL
const issueList = document.getElementById('issueList');   // Div onde os resultados são exibidos

// Quando o botão for clicado, chama a função principal "run".
btnAnalyze.addEventListener('click', run);

// ─────────────────────────────────────────────
// FUNÇÃO: fetchHTML
// Tenta buscar o HTML de uma URL externa usando proxies públicos.
// Isso é necessário porque o navegador bloqueia requisições diretas
// a outros domínios por segurança (política de CORS).
// ─────────────────────────────────────────────
async function fetchHTML(url) {
    // Lista de proxies públicos que "intermediam" a requisição para contornar o CORS.
    const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    // Tenta cada proxy em ordem. Se um falhar, tenta o próximo.
    for (const proxyUrl of proxies) {
        try {
            const res = await fetch(proxyUrl);
            if (!res.ok) continue; // Se a resposta não for bem-sucedida, pula para o próximo proxy.

            // O AllOrigins devolve um JSON com o HTML dentro da propriedade "contents".
            if (proxyUrl.includes('allorigins')) {
                const data = await res.json();
                if (data.contents) return data.contents; // Retorna o HTML como texto
            } else {
                // O corsproxy.io devolve o HTML diretamente como texto.
                return await res.text();
            }
        } catch (e) {
            // Se der erro de rede ou exceção, registra no console e tenta o próximo proxy.
            console.error(`Falha no proxy: ${proxyUrl}`);
        }
    }

    // Se nenhum proxy funcionar, retorna null para indicar falha.
    return null;
}

// ─────────────────────────────────────────────
// FUNÇÃO PRINCIPAL: run
// Orquestra todo o fluxo: lê a URL, busca o HTML e dispara a análise.
// ─────────────────────────────────────────────
async function run() {
    let url = urlInput.value.trim(); // Lê e remove espaços em branco da URL digitada.
    if (!url) return;               // Se o campo estiver vazio, não faz nada.

    // Garante que a URL tenha o protocolo. Ex: "exemplo.com" vira "https://exemplo.com".
    if (!url.startsWith('http')) url = 'https://' + url;

    // Referências aos elementos de estado visual (carregando / resultados).
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    // Exibe o indicador de carregamento e esconde os resultados anteriores.
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    issueList.innerHTML = ""; // Limpa qualquer resultado anterior da tela.

    // Tenta buscar o HTML da página informada.
    const html = await fetchHTML(url);

    if (html) {
        // Se obteve o HTML com sucesso, converte a string de texto em um documento DOM
        // para poder navegar e inspecionar os elementos como se fosse uma página real.
        const doc = new DOMParser().parseFromString(html, 'text/html');
        analyze(doc, url); // Chama a função de análise passando o documento e a URL original.
    } else {
        // Se todos os proxies falharam, exibe uma mensagem de erro ao usuário.
        alert("Erro de CORS: O site destino bloqueou o acesso via navegador. Tente outra URL ou use uma extensão de 'CORS Unblock' no Chrome para testar localmente.");
    }
    
    // Esconde o indicador de carregamento ao final, com sucesso ou falha.
    loading.classList.add('hidden');
}

// ─────────────────────────────────────────────
// FUNÇÃO: analyze
// Recebe o documento HTML parseado e verifica todas as imagens (<img>)
// em busca de problemas de acessibilidade no atributo "alt".
// ─────────────────────────────────────────────
function analyze(doc, url) {
    // Seleciona todas as tags <img> encontradas na página analisada.
    const imgs = doc.querySelectorAll('img');
    
    // Inicia o HTML do relatório com o título da análise.
    let html = `<h2>Análise de: ${url}</h2>`;
    let hasIssues = false; // Controle para saber se algum problema foi encontrado.

    // Caso nenhuma imagem seja encontrada na página.
    if (imgs.length === 0) {
        html += "<p>Nenhuma imagem encontrada nesta página.</p>";
    }

    // Itera sobre cada imagem encontrada.
    imgs.forEach((img, i) => {
        // Lê o valor do atributo "alt" da imagem (pode ser null se não existir).
        const alt = img.getAttribute('alt');

        // Pega os últimos 40 caracteres do nome do arquivo da imagem para usar nas mensagens.
        // Se não tiver "src", usa um texto padrão.
        const src = img.getAttribute('src')?.split('/').pop().substring(0, 40) || 'imagem sem src';
        
        let issue = ""; // Variável que guardará a mensagem de problema, se houver.

        // CASO 1: Atributo "alt" completamente ausente — erro crítico de acessibilidade.
        if (alt === null) {
            issue = `<p class="error"><strong>Erro:</strong> Imagem ${i+1} (${src}) não possui o atributo alt.</p>`;
        
        // CASO 2: Atributo "alt" existe mas está vazio — aceitável apenas para imagens decorativas.
        } else if (alt.trim() === '') {
            issue = `<p class="warn"><strong>Aviso:</strong> Imagem ${i+1} com alt vazio. Use apenas se for decorativa.</p>`;
        
        // CASO 3: Alt existe mas contém um texto genérico e não descritivo (ex: "foto", "banner").
        } else if (GENERIC_ALTS.includes(alt.toLowerCase().trim())) {
            issue = `<p class="warn"><strong>Aviso:</strong> Alt genérico ("${alt}") na Imagem ${i+1}.</p>`;
        }

        // Se algum problema foi identificado, adiciona ao relatório e marca que há issues.
        if (issue) {
            html += issue;
            hasIssues = true;
        }
    });

    // Se existem imagens e nenhuma delas teve problema, exibe mensagem de sucesso.
    if (!hasIssues && imgs.length > 0) {
        html += "<p class='success'>✅ Todas as imagens estão com alt configurado!</p>";
    }

    // Injeta o HTML do relatório no elemento de resultados e o torna visível.
    issueList.innerHTML = html;
    results.classList.remove('hidden');
}
