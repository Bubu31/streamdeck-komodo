import streamDeck, {
  type KeyDownEvent,
  type KeyUpEvent,
  SingletonAction,
  type WillAppearEvent,
  type WillDisappearEvent,
  type DidReceiveSettingsEvent,
  type SendToPluginEvent
} from "@elgato/streamdeck";
import { KomodoApi } from "../services/komodo-api";
import { IconGenerator } from "../services/icon-generator";
import {
  type StackStatusSettings,
  type StackStatusData,
  DEFAULT_SETTINGS
} from "../types/settings";
import { openBrowser } from "../utils/browser";

type ActionEvent = WillAppearEvent<StackStatusSettings>
  | KeyUpEvent<StackStatusSettings>
  | DidReceiveSettingsEvent<StackStatusSettings>;

export class StackStatusAction extends SingletonAction<StackStatusSettings> {
  override readonly manifestId = "com.komodo.stack-monitor.status";

  private api: KomodoApi;
  private iconGenerator: IconGenerator;
  private refreshIntervals: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private keyDownTimes: Map<string, number> = new Map();
  private lastStatusData: Map<string, StackStatusData> = new Map();

  private readonly LONG_PRESS_THRESHOLD = 1500; // 1.5 secondes

  constructor() {
    super();
    this.api = new KomodoApi();
    this.iconGenerator = new IconGenerator();
  }

  /**
   * Quand l'action apparaît sur le Stream Deck
   */
  override async onWillAppear(ev: WillAppearEvent<StackStatusSettings>): Promise<void> {
    const settings = { ...DEFAULT_SETTINGS, ...ev.payload.settings };
    const context = ev.action.id;

    streamDeck.logger.info(`Stack action appeared: ${context}`);

    // Afficher état de chargement
    await ev.action.setImage(this.iconGenerator.generateLoadingIcon());
    await ev.action.setTitle("");

    // Vérifier si un stack est configuré
    if (!settings.stackId) {
      await ev.action.setImage(this.iconGenerator.generateSetupIcon());
      return;
    }

    // Premier chargement des données
    await this.refreshData(ev, settings);

    // Démarrer le rafraîchissement automatique
    this.startRefreshInterval(context, ev, settings);
  }

  /**
   * Quand l'action disparaît
   */
  override onWillDisappear(ev: WillDisappearEvent<StackStatusSettings>): void {
    const context = ev.action.id;
    streamDeck.logger.info(`Stack action disappeared: ${context}`);
    this.stopRefreshInterval(context);
  }

  /**
   * Quand on appuie sur la touche
   */
  override async onKeyDown(ev: KeyDownEvent<StackStatusSettings>): Promise<void> {
    const context = ev.action.id;
    this.keyDownTimes.set(context, Date.now());
    streamDeck.logger.info("Key down - recording timestamp");
  }

  /**
   * Quand on relâche la touche
   */
  override async onKeyUp(ev: KeyUpEvent<StackStatusSettings>): Promise<void> {
    const context = ev.action.id;
    const settings = { ...DEFAULT_SETTINGS, ...ev.payload.settings };
    const keyDownTime = this.keyDownTimes.get(context) || Date.now();
    const pressDuration = Date.now() - keyDownTime;

    this.keyDownTimes.delete(context);

    if (pressDuration >= this.LONG_PRESS_THRESHOLD) {
      // Long press -> Ouvrir le dashboard Komodo
      streamDeck.logger.info(`Long press (${pressDuration}ms) - opening dashboard`);
      await this.handleLongPress(ev, settings);
    } else {
      // Short press -> Rafraîchir
      streamDeck.logger.info(`Short press (${pressDuration}ms) - refreshing`);
      await ev.action.setImage(this.iconGenerator.generateLoadingIcon());
      await this.refreshData(ev, settings);
    }
  }

  /**
   * Gestion du long press - ouvre le dashboard
   */
  private async handleLongPress(
    ev: KeyUpEvent<StackStatusSettings>,
    settings: StackStatusSettings
  ): Promise<void> {
    try {
      // Utiliser les settings locaux
      const baseUrl = settings.komodoUrl.replace(/\/+$/, '');
      const url = `${baseUrl}/stacks/${settings.stackId}`;

      await openBrowser(url);

      // Feedback visuel
      await ev.action.showOk();
    } catch (error) {
      streamDeck.logger.error(`Failed to open browser: ${error}`);
      await ev.action.showAlert();
    }
  }

  /**
   * Quand les settings changent dans le Property Inspector
   */
  override async onDidReceiveSettings(
    ev: DidReceiveSettingsEvent<StackStatusSettings>
  ): Promise<void> {
    const settings = { ...DEFAULT_SETTINGS, ...ev.payload.settings };
    const context = ev.action.id;

    streamDeck.logger.info(`Settings updated for: ${context}`);

    // Redémarrer l'intervalle
    this.stopRefreshInterval(context);

    if (settings.stackId) {
      this.startRefreshInterval(context, ev, settings);
      await this.refreshData(ev, settings);
    } else {
      await ev.action.setImage(this.iconGenerator.generateSetupIcon());
    }
  }

  /**
   * Réception de messages du Property Inspector
   */
  override async onSendToPlugin(
    ev: SendToPluginEvent<{ action: string }, StackStatusSettings>
  ): Promise<void> {
    const payload = ev.payload as { action: string };

    if (payload.action === 'getStacksList') {
      await this.sendStacksList(ev);
    }
  }

  /**
   * Envoie la liste des stacks au Property Inspector
   */
  private async sendStacksList(ev: SendToPluginEvent<unknown, StackStatusSettings>): Promise<void> {
    try {
      // Utiliser les settings de l'action (locaux)
      const settings = await ev.action.getSettings<StackStatusSettings>();

      if (!settings.komodoUrl || !settings.apiKey) {
        await streamDeck.ui.sendToPropertyInspector({
          action: 'stacksList',
          stacks: [],
          error: 'API not configured'
        });
        return;
      }

      const stacks = await this.api.listStacks(settings);

      await streamDeck.ui.sendToPropertyInspector({
        action: 'stacksList',
        stacks: stacks
      });
    } catch (error) {
      streamDeck.logger.error(`Failed to fetch stacks: ${error}`);
      await streamDeck.ui.sendToPropertyInspector({
        action: 'stacksList',
        stacks: [],
        error: String(error)
      });
    }
  }

  /**
   * Rafraîchit les données du stack
   */
  private async refreshData(
    ev: ActionEvent,
    settings: StackStatusSettings
  ): Promise<void> {
    try {
      // Utiliser les settings locaux (par action)
      if (!settings.komodoUrl || !settings.apiKey) {
        streamDeck.logger.warn("Komodo API not configured");
        await ev.action.setImage(this.iconGenerator.generateErrorIcon("Config"));
        return;
      }

      if (!settings.stackId) {
        await ev.action.setImage(this.iconGenerator.generateSetupIcon());
        return;
      }

      streamDeck.logger.info(`Fetching stack data: ${settings.stackId}`);

      const statusData = await this.api.getStackInfo(settings, settings.stackId);
      this.lastStatusData.set(ev.action.id, statusData);

      await this.updateDisplay(ev, statusData);

    } catch (error) {
      streamDeck.logger.error(`Failed to fetch stack data: ${error}`);

      // Utiliser le cache si disponible
      const cachedData = this.lastStatusData.get(ev.action.id);
      if (cachedData) {
        const cached = { ...cachedData, isCached: true };
        await this.updateDisplay(ev, cached);
      } else {
        await ev.action.setImage(this.iconGenerator.generateErrorIcon("Error"));
      }
    }
  }

  /**
   * Met à jour l'affichage du bouton
   */
  private async updateDisplay(
    ev: ActionEvent,
    data: StackStatusData
  ): Promise<void> {
    const icon = this.iconGenerator.generateStackIcon(
      data.name,
      data.state,
      data.servicesRunning,
      data.servicesTotal,
      data.hasUpdates
    );

    await ev.action.setImage(icon);
    await ev.action.setTitle(""); // Titre dans l'icône
  }

  /**
   * Démarre l'intervalle de rafraîchissement
   */
  private startRefreshInterval(
    context: string,
    ev: WillAppearEvent<StackStatusSettings> | DidReceiveSettingsEvent<StackStatusSettings>,
    settings: StackStatusSettings
  ): void {
    const intervalMs = settings.refreshInterval * 1000;

    const scheduleNext = () => {
      const timeout = setTimeout(async () => {
        try {
          await this.refreshData(ev, settings);
        } catch (error) {
          streamDeck.logger.error(`Refresh error: ${error}`);
        }
        if (this.refreshIntervals.has(context)) {
          scheduleNext();
        }
      }, intervalMs);

      this.refreshIntervals.set(context, timeout);
    };

    scheduleNext();
    streamDeck.logger.info(`Started refresh interval: ${settings.refreshInterval}s`);
  }

  /**
   * Arrête l'intervalle de rafraîchissement
   */
  private stopRefreshInterval(context: string): void {
    const timeout = this.refreshIntervals.get(context);
    if (timeout) {
      clearTimeout(timeout);
      this.refreshIntervals.delete(context);
      streamDeck.logger.info(`Stopped refresh interval for: ${context}`);
    }
  }
}
