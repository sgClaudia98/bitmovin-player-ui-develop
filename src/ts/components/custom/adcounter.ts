import { Label, LabelConfig } from '../label';
import { UIInstanceManager } from '../../uimanager';
import { AdBreakEvent, AdEvent, LinearAd, PlayerAPI, Ad, AdData } from 'bitmovin-player';
export interface AdCustom extends Ad {
  data?: AdCustomData;
}

export interface AdCustomData extends AdData {
  adTitle?: string;
}

/**
 * A label that displays a message about a running ad, optionally with a countdown.
 */
export class AdCounter extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClasses: ['ui-label-ad-counter', 'ui-label-ad-message'],
      text: 'Anunci {adIndex} de {adsLength}',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let text = String(config.text);
    let adNumber = 1;
    let adsNumber = 1;

    let updateMessageHandler = (adCount: number, adsCounter: number) => {
      this.setText(text.replace('{adIndex}', String(adCount)).replace('{adsLength}', String(adsCounter)));
    };

    let updateCount = () => {
      if ( adNumber < adsNumber ) {
        adNumber = adNumber + 1;
      }
      updateMessageHandler(adNumber, adsNumber);
    };

    updateMessageHandler(adNumber, adsNumber);

    player.on(player.exports.PlayerEvent.AdFinished, updateCount);

    player.on(player.exports.PlayerEvent.AdSkipped, updateCount);

    player.on(player.exports.PlayerEvent.AdBreakStarted, (event: AdBreakEvent) => {
      adsNumber = event.adBreak.ads.filter((ad: AdCustom) => ad.data.adTitle !== 'InVPAID').length;
      if ( adsNumber > 1 ) { this.show(); }
      updateMessageHandler(adNumber, adsNumber);
    });

    player.on(player.exports.PlayerEvent.AdBreakFinished, () => {
      this.hide();
      adsNumber = 1;
      adNumber = 1;
      updateMessageHandler(adNumber, adsNumber);
    });
  }
}