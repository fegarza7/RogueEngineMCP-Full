export function generateFocusControllerTemplate(
  name: string,
  states: string[] = ['loading', 'lobby', 'game']
): string {
  const stateRegistrations = states.map(s => `
  private setup${capitalize(s)}State(): FocusState {
    return this.fm.create('${s}')
      .ui({ visible: ['${s}-layer'] })
      .onEnter((_payload, ui) => {
        // TODO: render ${s} UI
        // new ${capitalize(s)}UI(ui.find('${s}-layer'), this.fm).render();
      })
      .onExit((_next) => {
        // TODO: cleanup ${s}
      });
  }`).join('\n');

  const registerCalls = states.map(s => `    this.fm.register(this.setup${capitalize(s)}State());`).join('\n');

  return `/**
 * @file ${name}.re.ts
 * @layer Layer 1 - Configuration
 * @purpose Application state controller using FocusFramework
 */
import * as RE from 'rogue-engine';
import { FocusManager } from '../rogue_packages/FocusFramework/FocusManager';
import { UILayerManager } from '../rogue_packages/FocusFramework/UILayerManager';
import { FocusState } from '../rogue_packages/FocusFramework/FocusManager';

@RE.registerComponent
export default class ${name} extends RE.Component {
  private fm!: FocusManager;

  start() {
    const ui = UILayerManager.getInstance();
    this.fm = new FocusManager(ui);

    // Create persistent layers (survive all state transitions)
    // ui.create('hud-layer', 50);

    // Register states
${registerCalls}

    // Start
    this.fm.switch('${states[0]}');
  }
${stateRegistrations}

  onRemoved() {
    // FocusManager auto-cleans listeners on state exit
  }
}
`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
