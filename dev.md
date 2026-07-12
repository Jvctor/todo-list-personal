# :martelo_e_chave: Diretrizes Globais: Front-End

Este repositório é focado exclusivamente no desenvolvimento do *Front-End*.

---

## :placa_pare: Regras de Ouro de Código e Segurança

### 1. Limitação de Input (Segurança contra DoS/Overflow)
Para prevenir ataques de payloads massivos, estouro de memória e inputs maliciosos, *toda entrada de dados deve ser estritamente limitada*.
* *HTML/Componentes:* Use obrigatoriamente maxLength em todos os campos (<input>, <textarea>).
* *Validação:* Bloqueie ou trate no estado qualquer valor que exceda os limites.
* *Padrões:* Inputs curtos (máx *150* caracteres) | Inputs longos (máx *2000* caracteres).

### 2. Auditoria de Segurança Automatizada (Anti-Brechas)
Antes de entregar qualquer componente ou fluxo, faça um check-up de segurança para garantir que não há vulnerabilidades client-side:
* *Prevenção de XSS:* Nunca renderize HTML bruto vindo do usuário diretamente na tela (evite propriedades como dangerouslySetInnerHTML ou equivalentes, a menos que os dados passem por uma biblioteca de sanitização como DOMPurify).
* *Exposição de Dados:* Garanta que chaves privadas de API, tokens ou dados sensíveis de configuração não estejam hardcoded no código (use variáveis de ambiente .env).

### 3. Legibilidade: Proibido Operador Ternário
* *Nunca* use o operador ternário (? :) para renderização condicional ou atribuição de variáveis.
* *Alternativas obrigatórias:* Use estruturas explícitas como if/else, curto-circuito com && (para renderização condicional simples), ou funções auxiliares (switch/objetos literais) se houver múltiplas condições.

### 4. Experiência do Usuário: Estados de Loading, Erro e Vazio
* Toda tela ou componente que dependa de dados assíncronos (requisições, promises) deve ter, obrigatoriamente, o tratamento visual para 3 estados: *Carregando (Loading), **Erro de Carregamento* e *Lista/Estado Vazio (Empty State)*.

### 5. Prevenção de Requisições Duplicadas (Anti-Double Click / Race Conditions)
* *Nunca permita que uma requisição idêntica aconteça em paralelo ou se repita antes da anterior terminar.*
* Ao realizar chamadas de API (integrações), use mecanismos de trava obrigatórios:
  * Desabilite botões de envio (disabled={isLoading}) assim que o gatilho for disparado.
  * Use técnicas de controle de concorrência (ex: debouncing, ou cancelamento de requests anteriores usando AbortController se necessário).

### 6. Garantia de Fluxo: Testes de Regressão
* Antes de propor qualquer alteração, refatoração ou nova feature, faça uma *análise de impacto*.
* Garanta e valide que o código sugerido não quebra os fluxos globais já existentes na aplicação.
* Se necessário, inclua ou sugira testes automatizados (unitários/integração) para blindar o comportamento atual contra regressões.

### 7. Código Limpo e Semântica: Proibido console.log e Tipos Genéricos
* *Nunca* deixe console.log, console.warn ou console.error de debug no código final.
* Se o projeto utilizar TypeScript, *é proibido o uso de any*. Todos os tipos e interfaces devem ser explicitamente declarados.
* Use HTML Semântico e garanta acessibilidade básica (ex: atributos alt em imagens e aria-label em botões de ícone).

### 8. Reutilização de Código: Verificação de Existência Global
* *Não duplique código.* Antes de criar uma nova função utilitária (utils), hook customizado, ícone ou componente visual, verifique (ou pergunte) se ele já existe no projeto.
* Se a funcionalidade for necessária e não existir, crie-a de forma genérica e *global* (ex: nas pastas src/components/common, src/utils, src/hooks) para que possa ser reaproveitada em todo o sistema.

### 9. Consistência Visual: Sistema de Cores e Temas (Design Tokens)
* *Proibido o uso de cores mágicas ou hexadecimais soltos* no código dos componentes (ex: color: #4A90E2).
* Use sempre as classes utilitárias de cores do *Tailwind CSS* configuradas no projeto (ou o sistema de variáveis globais definido).
* Se uma cor nova for necessária, ela deve ser adicionada primeiro ao arquivo de configuração global (ex: tailwind.config.js) antes de ser aplicada.

### 10. Compliance Estrito: Obediência ao CLAUDE.md
* *Você DEVE ler, revisar e seguir este arquivo CLAUDE.md antes de gerar qualquer resposta.*
* É terminantemente proibido ignorar qualquer uma das regras listadas acima. Se o usuário pedir algo que viole essas regras, alerte-o antes de prosseguir.

---

## :robô_cabeça: Instruções para o Claude
* Foque única e exclusivamente em soluções de Front-End.
* Forneça códigos limpos, modulares, tipados corretamente e altamente legíveis.
* *Obrigatório:* Siga 100% das regras de 1 a 10 deste documento em absolutamente todas as mensagens, sem exceção.