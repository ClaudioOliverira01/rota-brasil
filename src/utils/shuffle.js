/**
 * Embaralhamento (Fisher-Yates). O gerador aleatório pode ser trocado,
 * o que permite testar o resultado.
 */
export function shuffle(list, random = Math.random) {
  const copy = [...list];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function hasAlignedPair(items, targets) {
  return items.some(
    (item, index) => targets[index] && item.targetId === targets[index].id
  );
}

/**
 * Embaralha os cartões e os destinos de forma INDEPENDENTE e garante que,
 * quando as duas colunas têm o mesmo tamanho, nenhum cartão fique na mesma
 * posição (linha) do seu destino correto.
 *
 * Sem isso, quem só ligasse "linha com linha" acertaria tudo sem pensar
 * (era o problema da Fase 2: cartões e regiões na mesma ordem).
 */
export function arrangeMatch(items, targets, random = Math.random) {
  const needsCheck = items.length > 1 && items.length === targets.length;

  let arrangedItems = items;
  let arrangedTargets = targets;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    arrangedItems = shuffle(items, random);
    arrangedTargets = shuffle(targets, random);

    if (!needsCheck || !hasAlignedPair(arrangedItems, arrangedTargets)) {
      return { items: arrangedItems, targets: arrangedTargets };
    }
  }

  // Plano B (praticamente impossível de ser usado): gira os destinos em
  // uma posição, o que nunca alinha quando cada cartão tem um destino só.
  const ordered = arrangedItems.map(item =>
    targets.find(target => target.id === item.targetId)
  );

  if (ordered.every(Boolean) && new Set(ordered).size === ordered.length) {
    return {
      items: arrangedItems,
      targets: [...ordered.slice(1), ordered[0]]
    };
  }

  return { items: arrangedItems, targets: arrangedTargets };
}