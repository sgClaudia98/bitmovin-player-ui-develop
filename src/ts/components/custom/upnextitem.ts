import {Component, ComponentConfig} from '../component';
import {UIInstanceManager} from '../../uimanager';
import {DOM} from '../../dom';
import { PlaybackEvent, PlayerAPI } from 'bitmovin-player';
import { LocalizableText, i18n } from '../../localization/i18n';
import {StringUtils} from '../../stringutils';
// import { UINextItemConfig } from '../uiconfigcustom';

export interface UINextItemConfig {
    title?: string;
    url?: string;
    slug?: string;
    thumbnail?: string;
    duration?: number;
    positionPercentatgeOffset?: number;
    idint?: number;
}

export class UpnextItem extends Component<ComponentConfig> {
    private closed: boolean;
    private label: LocalizableText;
    itemConfig: UINextItemConfig;

    constructor(config: UINextItemConfig) {
        super({
            cssClasses: ['ui-up-next-item'],
            hidden: true,
        });
        this.closed = false;
        this.label = i18n.getLocalizer('next');
        this.itemConfig = config;
    }

    configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
        super.configure(player, uimanager);
        let duration = 0;
        let resta = 0;

        if ( this.itemConfig ) {
            player.on(player.exports.PlayerEvent.Play, () => {
                this.hide();
            });

            player.on(player.exports.PlayerEvent.SourceLoaded, () => {
                duration = player.getDuration();
                resta = duration * (this.itemConfig.positionPercentatgeOffset / 100);
            });
            player.on(player.exports.PlayerEvent.TimeChanged, (event: PlaybackEvent) => {
                if ( duration === 0 ) { duration = player.getDuration(); }
                resta = duration * (this.itemConfig.positionPercentatgeOffset / 100);
                duration - event.time <= resta && !this.closed ? this.show() : this.hide();
            });
        }
    }

    // Custom design of the button
    protected toDomElement(): DOM {
        let itemElement = new DOM('div', {
            'id': this.config.id,
            'class': this.getCssClasses(),
        });
        if (this.itemConfig) {
            let nextButton = new DOM('button', {
                'class': this.prefixCss('up-next-thumbnail'),
            }).css({ 'background-image': `url(${this.itemConfig.thumbnail})` });
            nextButton.on('click', () => {
                const info = {
                  idint: this.itemConfig.idint,
                  slug: this.itemConfig.slug,
                };
                const event = new CustomEvent('changeVideo', {
                    detail: info,
                });
                dispatchEvent(event);
              });
            itemElement.append(nextButton);

            let closeButton = new DOM('button', {
                'class': 'bmpui-up-next-close bmpui-ui-button',
            });
            closeButton.on('click', () => {
                this.closed = true;
                this.hide();
              });
            itemElement.append(closeButton);

            let bgElement = new DOM('div', {
                'class': this.prefixCss('background'),
            });
            nextButton.append(bgElement);

            let labelElement = new DOM('span', {
                'class': this.prefixCss('label'),
            }).append(new DOM('span', {
                'class': this.prefixCss('innerlabel'),
            }).html(i18n.performLocalization(this.label)));
            nextButton.append(labelElement);

            let titleElement = new DOM('span', {
                'class': this.prefixCss('label'),
            }).append(new DOM('span', {
                'class': this.prefixCss('innerlabel'),
            }).html(this.itemConfig.title));
            nextButton.append(titleElement);

            let timeElement = new DOM('span', {
                'class': this.prefixCss('title'),
            }).append(new DOM('span', {
                'class': this.prefixCss('innertitle'),
            }).html(this.itemConfig.duration ? StringUtils.secondsToTime(this.itemConfig.duration) : ''));

            nextButton.append(timeElement);

        }
        return itemElement;
    }
}