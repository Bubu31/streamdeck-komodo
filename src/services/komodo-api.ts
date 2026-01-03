import streamDeck from "@elgato/streamdeck";
import type { KomodoStack, StackListItem, StackStatusData, StackStatusSettings, StackState } from "../types/settings";

/** Settings nécessaires pour l'API */
type ApiSettings = Pick<StackStatusSettings, 'komodoUrl' | 'apiKey' | 'apiSecret'>;

/**
 * Client pour l'API REST Komodo
 */
export class KomodoApi {

  /**
   * Récupère la liste de tous les stacks
   */
  async listStacks(settings: ApiSettings): Promise<StackListItem[]> {
    const response = await this.request(settings, 'POST', '/read/ListStacks', {});

    if (!Array.isArray(response)) {
      throw new Error('Invalid response format');
    }

    return response.map((stack: KomodoStack) => ({
      id: stack.id,
      name: stack.name
    }));
  }

  /**
   * Récupère les informations détaillées d'un stack
   * On utilise ListStacks car GetStack ne contient pas status/state/services
   */
  async getStackInfo(settings: ApiSettings, stackId: string): Promise<StackStatusData> {
    const response = await this.request(settings, 'POST', '/read/ListStacks', {});

    if (!Array.isArray(response)) {
      throw new Error('Invalid response format');
    }

    // Trouver le stack par ID
    const stack = response.find((s: any) => s.id === stackId);

    if (!stack) {
      throw new Error(`Stack ${stackId} not found`);
    }

    const info = stack.info || {};
    const status = info.status || 'unknown';
    const state = info.state || 'unknown';
    const services = info.services || [];
    const runningCount = this.parseRunningCount(status);

    return {
      id: stack.id,
      name: stack.name,
      state: this.normalizeState(state),
      status: status,
      servicesTotal: services.length,
      servicesRunning: runningCount,
      hasUpdates: services.some((s: any) => s.update_available),
      fetchedAt: Date.now(),
      isCached: false
    };
  }

  /**
   * Normalise l'état pour s'assurer qu'il est valide
   */
  private normalizeState(state: string): StackState {
    const validStates: StackState[] = ['running', 'stopped', 'restarting', 'unknown'];
    return validStates.includes(state as StackState) ? state as StackState : 'unknown';
  }

  /**
   * Parse le status "running(7)" pour extraire le nombre
   */
  private parseRunningCount(status: string): number {
    const match = status.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Exécute une requête vers l'API Komodo
   */
  private async request(
    settings: ApiSettings,
    method: string,
    endpoint: string,
    body: object
  ): Promise<unknown> {
    // Nettoyer l'URL (enlever le slash final si présent)
    const baseUrl = settings.komodoUrl.replace(/\/+$/, '');
    const url = `${baseUrl}${endpoint}`;

    streamDeck.logger.info(`Komodo API: ${method} ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': settings.apiKey,
          'X-API-SECRET': settings.apiSecret
        },
        body: JSON.stringify(body)
      });

      streamDeck.logger.info(`Komodo API response status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        streamDeck.logger.error(`Komodo API error: ${response.status} - ${text}`);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      streamDeck.logger.info(`Komodo API response received: ${JSON.stringify(data).substring(0, 200)}`);
      return data;
    } catch (error) {
      streamDeck.logger.error(`Komodo API fetch error: ${error}`);
      throw error;
    }
  }
}
