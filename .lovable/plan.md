

## Plano: Autoplay + Pausa em chamadas

O autoplay já está parcialmente implementado (linhas 134-145), mas há dois problemas a resolver:

### 1. Autoplay robusto
O código atual já chama `setPlaying(true)` após carregar os environments. Porém, navegadores bloqueiam autoplay de áudio sem interação do usuário. Vamos melhorar com:
- Tentar `audio.play()` imediatamente — se falhar (autoplay bloqueado), registrar um listener de primeiro toque/clique que inicia a reprodução automaticamente
- Isso garante que, mesmo se o navegador bloquear, o primeiro toque em qualquer lugar da tela dispara o play

### 2. Remover auto-resume após interrupção (chamadas)
Atualmente, duas partes do código re-iniciam o áudio após pausa do sistema:
- **Linha 267-278**: Safari nativo — `onInterruptPause` tenta `audio.play()` após 1s
- **Linha 413-422**: Streams diretos — `onDirectPause` faz o mesmo

**Ação:** Remover ambas as lógicas de auto-resume e, em vez disso, chamar `setPlaying(false)` quando o sistema pausar o áudio (detectado quando `isPlayingRef.current === true` mas o áudio foi pausado externamente). Isso faz o player parar e o usuário religa manualmente.

### Arquivos alterados
- `src/components/AudioEngine.tsx`

### Resumo das mudanças
1. Adicionar fallback de autoplay: listener `click`/`touchstart` no document que faz play na primeira interação se autoplay foi bloqueado
2. Remover `onInterruptPause` (Safari HLS nativo, linhas 267-278)
3. Remover `onDirectPause` (streams diretos, linhas 413-422)
4. Nos listeners de `pause`, detectar pausa externa e chamar `setPlaying(false)`

