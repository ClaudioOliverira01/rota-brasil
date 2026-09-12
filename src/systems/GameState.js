const DEFAULT_STATE = { 
  playerId: null, 
  nickname: "", 
  avatar: "ae", 
  currentPhase: 1, 
  score: 0, 
  stars: 0, 
  completedPhases: [], 
  accessibility: { narration: true, highContrast: false, reducedMotion: false } 
}; 

let state = structuredClone(DEFAULT_STATE); 

export const GameState = { 
  reset() { 
    state = structuredClone(DEFAULT_STATE); 
  }, 
  
  get() { 
    return state; 
  }, 
  
  hydrate(savedState) { 
    state = { 
      ...structuredClone(DEFAULT_STATE), 
      ...(savedState || {}), 
      accessibility: { 
        ...DEFAULT_STATE.accessibility, 
        ...(savedState?.accessibility || {}) 
      }, 
      completedPhases: Array.isArray(savedState?.completedPhases) 
        ? [...savedState.completedPhases] 
        : [] 
    }; 
  }, 
  
  setPlayer({ nickname, avatar, playerId = null }) { 
    state.nickname = nickname; 
    state.avatar = avatar; 
    state.playerId = playerId; 
  }, 
  
  addScore(points) { 
    state.score += Number(points) || 0; 
  }, 
  
  addStar() { 
    state.stars += 1; 
  }, 
  
  completePhase(phaseId) { 
    if (!state.completedPhases.includes(phaseId)) { 
      state.completedPhases.push(phaseId); 
    } 
    state.currentPhase = Math.min(phaseId + 1, 4); 
  }, 
  
  setAccessibility(settings) { 
    state.accessibility = { ...state.accessibility, ...settings }; 
  }, 

  applyRemoteProgress(progress) { 
    if (!progress) { 
      return; 
    } 

    state.currentPhase = Number(
      progress.currentPhase || 
      state.currentPhase
    ); 

    state.score = Number(
      progress.score || 0
    ); 

    state.stars = Number(
      progress.stars || 0
    ); 

    state.completedPhases = Array.isArray(progress.completedPhases) 
      ? [...progress.completedPhases] 
      : []; 

    if (progress.accessibility) { 
      state.accessibility = { 
        ...state.accessibility, 
        ...progress.accessibility 
      }; 
    } 
  } 
};
