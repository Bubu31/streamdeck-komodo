import type { StackState } from "../types/settings";

/**
 * Génère des icônes SVG dynamiques pour les stacks Komodo
 * Taille: 144x144 (@2x pour rendu net)
 */
export class IconGenerator {
  private readonly SIZE = 144;
  private readonly PADDING = 10;

  /**
   * Génère l'icône principale du stack
   */
  generateStackIcon(
    stackName: string,
    state: StackState,
    servicesRunning: number,
    servicesTotal: number,
    hasUpdates: boolean = false
  ): string {
    const stateColor = this.getStateColor(state);
    const bgColor = this.getBackgroundColor(state);

    // Tronquer le nom si trop long
    const displayName = this.truncateName(stackName, 10);

    const svg = `
      <svg width="${this.SIZE}" height="${this.SIZE}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="100%" height="100%" fill="#0d1117"/>

        <!-- Border with state color -->
        <rect
          x="${this.PADDING}" y="${this.PADDING}"
          width="${this.SIZE - this.PADDING * 2}"
          height="${this.SIZE - this.PADDING * 2}"
          fill="${bgColor}"
          stroke="${stateColor}"
          stroke-width="4"
          rx="12"
        />

        <!-- Stack name -->
        <text
          x="${this.SIZE / 2}"
          y="38"
          text-anchor="middle"
          fill="white"
          font-family="Arial, sans-serif"
          font-size="18"
          font-weight="bold"
        >${this.escapeXml(displayName)}</text>

        <!-- State indicator circle -->
        <circle
          cx="${this.SIZE / 2}"
          cy="68"
          r="12"
          fill="${stateColor}"
        />

        <!-- Services count -->
        <text
          x="${this.SIZE / 2}"
          y="105"
          text-anchor="middle"
          fill="#8b949e"
          font-family="Arial, sans-serif"
          font-size="16"
        >${servicesRunning}/${servicesTotal}</text>

        <!-- Update indicator (if needed) -->
        ${hasUpdates ? this.generateUpdateBadge() : ''}
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
  }

  /**
   * Badge de mise à jour disponible
   */
  private generateUpdateBadge(): string {
    return `
      <circle cx="115" cy="25" r="10" fill="#d29922"/>
      <text x="115" y="30" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
    `;
  }

  /**
   * Icône d'erreur
   */
  generateErrorIcon(message: string = "Error"): string {
    const svg = `
      <svg width="${this.SIZE}" height="${this.SIZE}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0d1117"/>
        <rect
          x="${this.PADDING}" y="${this.PADDING}"
          width="${this.SIZE - this.PADDING * 2}"
          height="${this.SIZE - this.PADDING * 2}"
          fill="none" stroke="#f85149" stroke-width="4" rx="12"
        />
        <text x="${this.SIZE / 2}" y="65" text-anchor="middle" fill="#f85149" font-family="Arial" font-size="40" font-weight="bold">!</text>
        <text x="${this.SIZE / 2}" y="100" text-anchor="middle" fill="#f85149" font-family="Arial" font-size="16">${this.escapeXml(message)}</text>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
  }

  /**
   * Icône de chargement
   */
  generateLoadingIcon(): string {
    const svg = `
      <svg width="${this.SIZE}" height="${this.SIZE}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0d1117"/>
        <rect
          x="${this.PADDING}" y="${this.PADDING}"
          width="${this.SIZE - this.PADDING * 2}"
          height="${this.SIZE - this.PADDING * 2}"
          fill="none" stroke="#21262d" stroke-width="4" rx="12"
        />
        <text x="${this.SIZE / 2}" y="${this.SIZE / 2 + 6}" text-anchor="middle" fill="#8b949e" font-family="Arial" font-size="24">...</text>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
  }

  /**
   * Icône de configuration requise
   */
  generateSetupIcon(): string {
    const svg = `
      <svg width="${this.SIZE}" height="${this.SIZE}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0d1117"/>
        <rect
          x="${this.PADDING}" y="${this.PADDING}"
          width="${this.SIZE - this.PADDING * 2}"
          height="${this.SIZE - this.PADDING * 2}"
          fill="none" stroke="#21262d" stroke-width="4" rx="12"
        />
        <text x="${this.SIZE / 2}" y="60" text-anchor="middle" fill="#8b949e" font-family="Arial" font-size="36">?</text>
        <text x="${this.SIZE / 2}" y="100" text-anchor="middle" fill="#8b949e" font-family="Arial" font-size="16">Select</text>
        <text x="${this.SIZE / 2}" y="118" text-anchor="middle" fill="#8b949e" font-family="Arial" font-size="16">Stack</text>
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
  }

  /**
   * Couleur selon l'état
   */
  private getStateColor(state: StackState): string {
    switch (state) {
      case 'running': return '#3fb950';      // Vert
      case 'stopped': return '#f85149';      // Rouge
      case 'restarting': return '#d29922';   // Jaune
      default: return '#8b949e';             // Gris
    }
  }

  /**
   * Couleur de fond selon l'état
   */
  private getBackgroundColor(state: StackState): string {
    switch (state) {
      case 'running': return '#0d2818';      // Vert sombre
      case 'stopped': return '#2d1418';      // Rouge sombre
      case 'restarting': return '#2d2418';   // Jaune sombre
      default: return '#1a1a1a';             // Gris sombre
    }
  }

  /**
   * Tronque le nom pour l'affichage
   */
  private truncateName(name: string, maxLength: number): string {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 1) + '.';
  }

  /**
   * Échappe les caractères XML
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
