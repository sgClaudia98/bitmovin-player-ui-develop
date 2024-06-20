import { Button } from '../button';
import {Container, ContainerConfig} from '../container';
import { PlayerAPI } from 'bitmovin-player';
import { PlaybackToggleButton } from '../playbacktogglebutton';
import { i18n } from '../../localization/i18n';

/**
 * Overlays the player and displays error messages.
 */
export class ControlsOverlay extends Container<ContainerConfig> {

  private playbackToggleButton: PlaybackToggleButton;
  private rewindButton;
  private forwardButton;
  private startOverButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.playbackToggleButton = new PlaybackToggleButton();
    this.forwardButton = new Button({cssClasses: ['ui-forwardbutton', 'ui-button'], ariaLabel: i18n.getLocalizer('forwardButton')});
    this.rewindButton = new Button({cssClasses: ['ui-rewindbutton', 'ui-button'], ariaLabel: i18n.getLocalizer('rewindButton')});
    this.startOverButton = new Button({hidden: true, cssClasses: ['ui-startoverbutton', 'ui-button'], ariaLabel: i18n.getLocalizer('startOverButton')});

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-controls-overlay',
      components: [this.startOverButton, this.rewindButton, this.playbackToggleButton, this.forwardButton],
    }, this.config);
  }

  configure(player: PlayerAPI): void {

    let isLive = false;

    this.rewindButton.onClick.subscribe(function () {
      if (isLive) {
        player.timeShift(player.getTimeShift() - 10);
      } else {
        player.seek(Math.max(0, player.getCurrentTime() - 10));
      }
    });

    this.forwardButton.onClick.subscribe(function () {
      if (player.isLive()) {
        player.timeShift(Math.min(0, player.getTimeShift() + 10));
      } else {
        player.seek(Math.min(player.getDuration(), player.getCurrentTime() + 10));
      }
    });

    this.startOverButton.onClick.subscribe(function () {
      const event = new CustomEvent('startOver', {
        detail: { actiu: true},
      });
      dispatchEvent(event);
    });

    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      isLive = player.isLive();
      if (isLive && ( window.location.hash === '' || window.location.hash.indexOf('desplacament') < 0 )) {
        this.startOverButton.show();
      }
    });
  }
}