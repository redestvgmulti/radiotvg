

## Diagnóstico

Os logs mostram o problema claramente:

```
Direct stream loaded — https://stm3.xcast.com.br:9946/;
audio waiting
audio stalled
Direct stream error — will retry in 10s
System interruption detected (direct) — stopping playback
```

**Causa raiz:** Existe um conflito entre dois listeners no mesmo elemento `<audio>`:

1. `onDirectError` — detecta erro de stream e agenda retry em 10s
2. `onDirectPause` — detecta pausa e assume que é interrupção do sistema (chamada telefônica)

Quando o stream dá erro, o navegador pausa o áudio automaticamente. Isso dispara `onDirectPause`, que interpreta incorretamente como uma chamada telefônica e chama `setPlaying(false)`. Com `isPlaying = false`, o retry de 10s não consegue reiniciar o áudio porque `isPlayingRef.current` é `false`.

**Resultado:** O stream morre permanentemente após qualquer erro de rede, sem possibilidade de recuperação.

## Plano de Correção

**Arquivo:** `src/components/AudioEngine.tsx`

1. **Adicionar flag `isRetryingRef`** — Um ref booleano que indica quando o sistema está em processo de retry por erro de stream.

2. **No `onDirectError`**: Setar `isRetryingRef.current = true` antes de agendar o retry, e no retry limpar a flag.

3. **No `onDirectPause`**: Verificar `isRetryingRef.current` — se for `true`, ignorar (não é interrupção do sistema, é erro de stream). Também verificar `audio.error` como proteção adicional.

4. **Mesma lógica para o path nativo Safari** (`onInterruptPause`, linhas 298-303): aplicar a mesma verificação.

5. **No retry do `onDirectError`**: Forçar `setPlaying(true)` para garantir que o estado permite reprodução após reconexão.

Isso corrige o ciclo vicioso mantendo a detecção de chamadas telefônicas funcional.

