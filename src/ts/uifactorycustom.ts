import { SubtitleOverlay } from './components/subtitleoverlay';
import { SettingsPanelPage } from './components/settingspanelpage';
import { SettingsPanelItem } from './components/settingspanelitem';
import { VideoQualitySelectBox } from './components/videoqualityselectbox';
import { PlaybackSpeedSelectBox } from './components/playbackspeedselectbox';
import { AudioTrackSelectBox } from './components/audiotrackselectbox';
import { AudioQualitySelectBox } from './components/audioqualityselectbox';
import { SettingsPanel } from './components/settingspanel';
import { SubtitleSettingsPanelPage } from './components/subtitlesettings/subtitlesettingspanelpage';
import { SettingsPanelPageOpenButton } from './components/settingspanelpageopenbutton';
import { SubtitleListBox } from './components/subtitlelistbox';
import { SubtitleSettingsLabel } from './components/subtitlesettings/subtitlesettingslabel';
import { SubtitleSelectBox } from './components/subtitleselectbox';
import { ControlBar } from './components/controlbar';
import { Container } from './components/container';
import { PlaybackTimeLabelMode } from './components/playbacktimelabel';
import { SeekBar } from './components/seekbar';
import { SeekBarLabel } from './components/seekbarlabel';
import { PlaybackToggleButton } from './components/playbacktogglebutton';
import { VolumeToggleButton } from './components/volumetogglebutton';
import { VolumeSlider } from './components/volumeslider';
import { Spacer } from './components/spacer';
import { AirPlayToggleButton } from './components/airplaytogglebutton';
import { CastToggleButton } from './components/casttogglebutton';
import { VRToggleButton } from './components/vrtogglebutton';
import { SettingsToggleButton } from './components/settingstogglebutton';
import { FullscreenToggleButton } from './components/fullscreentogglebutton';
import { UIContainer } from './components/uicontainer';
import { BufferingOverlay } from './components/custom/bufferingoverlay';
import { PlaybackToggleOverlay } from './components/playbacktoggleoverlay';
import { CastStatusOverlay } from './components/caststatusoverlay';
import { TitleBar } from './components/titlebar';
import { RecommendationOverlay } from './components/custom/recommendationoverlaycustom';
import { UpnextItem } from './components/custom/upnextitem';
import { ErrorMessageOverlay } from './components/errormessageoverlay';
import { AdClickOverlay } from './components/adclickoverlay';
import { AdMessageLabel } from './components/admessagelabel';
import { AdSkipButton } from './components/custom/adskipbutton';
import { PlayerUtils } from './playerutils';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from './localization/i18n';
import { Button } from './components/button';
import { ToggleButton } from './components/togglebutton';
// import { UIConfig } from './uiconfig';
import { UIConditionContext, UIManager } from './uimanager';
import { UINextItemConfig, UIRecommendationConfig } from './uiconfigcustom';
import { UIConfig } from './uiconfig';
import { UIFactory } from './uifactory';
import { ControlsOverlay } from './components/custom/controlsoverlay';
import { PlaybackTimeLabel } from './components/custom/playbacktimelabel';

export interface UIConfigCustom extends UIConfig {
  nextItem?: UINextItemConfig;
  recommendations?: UIRecommendationConfig[];
}

export namespace UIFactoryCustom {


  export function buildModernUI(player: PlayerAPI, config: UIConfigCustom = {}): UIManager {
    return new UIManager(player, [ {
      ui: customAdsUI(),
      condition: (context: UIConditionContext) => {
        return context.isAd && context.adRequiresUi ;
      },
    },  {
      ui: makeCustomUI(player, config),
      condition: (context: UIConditionContext) => {
        return !context.isAd && !context.adRequiresUi ;
      },
    }], config);
  }

  function makeCustomUI(player: PlayerAPI, config: UIConfigCustom) {
    
    let mainSettingsPanelPage = new SettingsPanelPage({
      components: [
        new SettingsPanelItem(i18n.getLocalizer('settings.video.quality'), new VideoQualitySelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('settings.audio.quality'), new AudioQualitySelectBox()),
        new SettingsPanelItem(i18n.getLocalizer('settings.audio.track'), new AudioTrackSelectBox()),
      ],
    });

    let settingsPanel = new SettingsPanel({
      components: [
        mainSettingsPanelPage,
      ],
      hidden: true,
    });

    // subtitols accessibles des de la icona de configuracio
    let subtitleOverlay = new SubtitleOverlay();

    let subtitleSettingsPanelPage = new SubtitleSettingsPanelPage({
      settingsPanel: settingsPanel,
      overlay: subtitleOverlay,
    });

    const subtitleSelectBox = new SubtitleSelectBox();

    let subtitleSettingsOpenButton = new SettingsPanelPageOpenButton({
      targetPage: subtitleSettingsPanelPage,
      container: settingsPanel,
      ariaLabel: i18n.getLocalizer('settings.subtitles'),
      text: i18n.getLocalizer('open'),
    });

    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(
        new SubtitleSettingsLabel({
          text: i18n.getLocalizer('settings.subtitles'),
          opener: subtitleSettingsOpenButton,
        }),
        subtitleSelectBox,
        {
          role: 'menubar',
        },
      ));

    settingsPanel.addComponent(subtitleSettingsPanelPage);

    // afegir velocitat com a opcio de configuracio
    mainSettingsPanelPage.addComponent(
      new SettingsPanelItem(i18n.getLocalizer('speed'), new PlaybackSpeedSelectBox()),
    );

    // subtitols accessibles des del seu propi boto a la barra de control (nomes idioma)
    let subtitleListBox = new SubtitleListBox();

    let subtitleListBoxSettingsPanelPage = new SettingsPanelPage({
        components: [
            new SettingsPanelItem(null, subtitleListBox),
        ],
    });

    let subtitleSettingsPanel = new SettingsPanel({
        components: [
            subtitleListBoxSettingsPanelPage,
        ],
        hidden: true,
        pageTransitionAnimation: false,
        cssClasses: ['ui-settings-subtitles'],
    });

    let subtitlesToggleButton = new SettingsToggleButton({
      settingsPanel: subtitleSettingsPanel,
      ariaLabel: i18n.getLocalizer('settings.subtitles'),
      text: i18n.getLocalizer('settings.subtitles'),
      cssClasses: ['ui-subtitlesettingstogglebutton'],
    });

    // resta de botons de la barra de control
    let rewindButton = new Button({cssClasses: ['ui-rewindbutton', 'ui-button']});
    rewindButton.onClick.subscribe(function () {
        player.seek(Math.max(0, player.getCurrentTime() - 10));
    });

    let forwardButton = new Button({cssClasses: ['ui-forwardbutton', 'ui-button']});
    forwardButton.onClick.subscribe(function () {
        player.seek(Math.min(player.getDuration(), player.getCurrentTime() + 10));
    });

    let recommendationOverlay = new RecommendationOverlay({}, player);
    let hideRecommendations = !(config.recommendations && config.recommendations.length > 0);
    let mosaicButton = new Button({
      hidden: hideRecommendations,
      cssClasses: ['ui-mosaicbutton', 'ui-button'],
      ariaLabel: i18n.getLocalizer('settings.moreVideos'),
      text: i18n.getLocalizer('settings.moreVideos'),
    });
    mosaicButton.onClick.subscribe(function () {
      recommendationOverlay.openMosaic();
    });

    let pipButton = new ToggleButton({
      ariaLabel: i18n.getLocalizer('pictureInPicture'),
      text: i18n.getLocalizer('pictureInPicture'),
      cssClass: 'ui-piptogglebutton',
    });

    pipButton.onClick.subscribe(async function () {
        try {
            if (player.getVideoElement() !== document.pictureInPictureElement) {
                await player.getVideoElement().requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        }
        catch (error) {
            console.log('' + error);
        }
    });

    let popupButton = new Button({
      cssClasses: ['ui-popupbutton', 'ui-button'],
      ariaLabel: i18n.getLocalizer('settings.audio.popup'),
      text: i18n.getLocalizer('settings.audio.popup'),
    });
    popupButton.onClick.subscribe(function () {
      const event = new CustomEvent('openPopup');
      dispatchEvent(event);
      player.pause();
    });

    let controlBarBottomComponents = [
      new ControlsOverlay(),
      new VolumeToggleButton(),
      new VolumeSlider(),
      new Spacer(),
      subtitlesToggleButton,
      new SettingsToggleButton({ settingsPanel: settingsPanel }),
      popupButton,
      mosaicButton,
      pipButton,
      new FullscreenToggleButton(),
      new CastToggleButton(),
      new AirPlayToggleButton(),
      new VRToggleButton(),
    ];

    let controlBar = new ControlBar({
      components: [
        subtitleSettingsPanel,
        settingsPanel,
        new Container({
          components: [
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.CurrentTime, hideInLivePlayback: true }),
            new SeekBar({ label: new SeekBarLabel() }),
            new PlaybackTimeLabel({ timeLabelMode: PlaybackTimeLabelMode.TotalTime, cssClasses: ['text-right'] }),
          ],
          cssClasses: ['controlbar-top'],
        }),
        new Container({
          components: controlBarBottomComponents,
          cssClasses: ['controlbar-bottom'],
        }),
      ],
    });

    return new UIContainer({
      components: [
        subtitleOverlay,
        new BufferingOverlay(),
        new PlaybackToggleOverlay(),
        new CastStatusOverlay(),
        new UpnextItem(config.nextItem),
        controlBar,
        new TitleBar(),
        recommendationOverlay,
        new ErrorMessageOverlay(),
      ],
      hideDelay: 2000,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }
  

  /****************************************************/
  // ads ui
  /****************************************************/

  function makeCustomAdsUI(isMobile: boolean) {
    let controlBarBottomComponents = [
      new PlaybackToggleButton(),
      new VolumeToggleButton(),
      new VolumeSlider(),
      new Spacer(),
    ];
    if ( !isMobile ) { controlBarBottomComponents.push( new FullscreenToggleButton() ); }

    return new UIContainer({
      components: [
        new BufferingOverlay(),
        new AdClickOverlay(),
        new PlaybackToggleOverlay(),
        new Container({
          components: [
            new AdMessageLabel({ text: i18n.getLocalizer('ads.remainingTime')}),
            new AdSkipButton(),
          ],
          cssClass: 'ui-ads-status',
        }),
        new ControlBar({
          components: [
            new Container({
              components: controlBarBottomComponents,
              cssClasses: ['controlbar-bottom'],
            }),
          ],
        }),
      ],
      cssClasses: ['ui-skin-ads'],
      hideDelay: -1,
      hidePlayerStateExceptions: [
        PlayerUtils.PlayerState.Prepared,
        PlayerUtils.PlayerState.Paused,
        PlayerUtils.PlayerState.Finished,
      ],
    });
  }

  // mobile ads ui: no fullscreen
  export function customEmbedMobileAdsUI() {
    return makeCustomAdsUI(true);
  }

  // ads ui
  export function customAdsUI() {
    return makeCustomAdsUI(false);
  }
}