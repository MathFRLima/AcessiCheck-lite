# AcessiCheck Lite

Ferramenta leve e gratuita para verificar problemas de acessibilidade em imagens de qualquer página web — direto pelo navegador, sem instalação.

---

## O que ele faz

O AcessiCheck Lite analisa todas as tags `<img>` de uma URL informada e identifica três tipos de problema no atributo `alt`:

| Tipo | Descrição |
|---|---|
| 🔴 **Erro** | Imagem sem o atributo `alt` — falha crítica de acessibilidade |
| 🟡 **Aviso** | Atributo `alt` presente mas vazio — aceitável apenas em imagens decorativas |
| 🟡 **Aviso** | Texto alternativo genérico como `"foto"`, `"banner"`, `"logo"`, etc. |

Se todas as imagens estiverem corretas, exibe uma mensagem de sucesso ✅.

---

## Como usar

1. [Click aqui](https://mathfrlima.github.io/AcessiCheck-lite/) ou Abra o arquivo `index.html` no navegador
2. Digite a URL da página que deseja analisar
3. Clique em **Analisar** ou pressione **Enter**
4. Veja o relatório com os problemas encontrados

> **Nota:** alguns sites bloqueiam o acesso externo via CORS. Nesses casos, uma mensagem de erro será exibida. Uma alternativa é instalar a extensão [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/) no Chrome.

---

## Estrutura do projeto

```
├── index.html   # Estrutura da interface
├── style.css    # Estilização visual
└── app.js       # Lógica de busca e análise
```

---

## Como funciona internamente

Como o navegador bloqueia requisições diretas a outros domínios (política de CORS), o app usa dois proxies públicos como intermediários para buscar o HTML da URL informada:

1. `api.allorigins.win` — retorna o HTML dentro de um JSON (`.contents`)
2. `corsproxy.io` — retorna o HTML diretamente como texto

Se o primeiro falhar, tenta o segundo. Se ambos falharem, exibe uma mensagem de erro ao usuário.

O HTML recebido é parseado com `DOMParser` e todas as tags `<img>` são inspecionadas.

---

## Textos alternativos considerados genéricos

Os seguintes valores no atributo `alt` são sinalizados como aviso por não descreverem a imagem de forma útil:

`image`, `imagem`, `foto`, `photo`, `logo`, `icon`, `ícone`, `banner`

---

## Tecnologias

- HTML5, CSS3 e JavaScript puro (Vanilla JS)
- Sem frameworks, sem dependências externas
- Funciona offline após o primeiro carregamento (exceto a busca via proxy)

---

## Por que acessibilidade de imagens importa

O atributo `alt` é lido por leitores de tela usados por pessoas com deficiência visual. Sem ele — ou com valores vagos — o conteúdo da imagem se torna completamente inacessível, violando as diretrizes [WCAG 2.1 (critério 1.1.1)](https://www.w3.org/TR/WCAG21/#non-text-content).
