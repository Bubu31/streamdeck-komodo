/**
 * Données d'un service dans un stack
 */
export interface KomodoService {
  service: string;
  image: string;
  update_available: boolean;
}

/**
 * États possibles d'un stack
 */
export type StackState = 'running' | 'stopped' | 'restarting' | 'unknown';

/**
 * Données d'un stack Komodo
 */
export interface KomodoStack {
  id: string;
  name: string;
  info: {
    state: StackState;
    status: string;
    services: KomodoService[];
    server_id: string;
  };
}

/**
 * Liste simplifiée des stacks pour le dropdown
 */
export interface StackListItem {
  id: string;
  name: string;
}

/**
 * Settings par action (par bouton)
 */
export interface StackStatusSettings {
  /** URL de base de l'API Komodo */
  komodoUrl: string;
  /** API Key Komodo */
  apiKey: string;
  /** API Secret Komodo */
  apiSecret: string;
  /** ID du stack sélectionné */
  stackId: string;
  /** Nom du stack (pour affichage) */
  stackName: string;
  /** Intervalle de rafraîchissement en secondes */
  refreshInterval: number;
}

/**
 * Settings globaux (authentification)
 */
export interface GlobalSettings {
  /** URL de base de l'API Komodo */
  komodoUrl: string;
  /** API Key Komodo */
  apiKey: string;
  /** API Secret Komodo */
  apiSecret: string;
  /** Cache des stacks disponibles */
  stacksCache?: StackListItem[];
  /** Timestamp du dernier fetch de la liste */
  stacksCacheTime?: number;
}

/**
 * Données de status d'un stack
 */
export interface StackStatusData {
  id: string;
  name: string;
  state: StackState;
  status: string;
  servicesTotal: number;
  servicesRunning: number;
  hasUpdates: boolean;
  fetchedAt: number;
  isCached: boolean;
}

/**
 * Valeurs par défaut
 */
export const DEFAULT_SETTINGS: StackStatusSettings = {
  komodoUrl: '',
  apiKey: '',
  apiSecret: '',
  stackId: '',
  stackName: '',
  refreshInterval: 30
};

export const DEFAULT_GLOBAL_SETTINGS: Partial<GlobalSettings> = {
  komodoUrl: '',
  apiKey: '',
  apiSecret: ''
};
