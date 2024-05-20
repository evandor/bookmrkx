import _ from "lodash"
import {FeatureIdent, FeatureType} from "src/models/FeatureIdent";
import {Feature} from "src/features/models/Feature";

export class AppFeatures {
  features: Feature[] = [
    new Feature(FeatureIdent.WINDOWS_MANAGEMENT, FeatureType.RECOMMENDED, 'Windows Management',
      'Quick access to all your open windows', 'grid_view', '', ['bex']),

    // new AppFeature(FeatureIdent.OPEN_TABS, FeatureType.RECOMMENDED, 'Open Tabs', 'o_playlist_add', ['bex']),
    //
    // new AppFeature(FeatureIdent.OPENTABS_THRESHOLD, FeatureType.OPTIONAL, 'Open Tabs Warnings', 'o_tab', ['bex']),
    //
    // new AppFeature(FeatureIdent.STANDALONE_APP, FeatureType.RECOMMENDED, 'Standalone App', 'o_open_in_new', ['bex']),
    //
    // new AppFeature(FeatureIdent.NOTIFICATIONS, FeatureType.RECOMMENDED, 'Browser Notifications', 'o_notifications', ['all'])
    //   .setActivateCommands([new GrantPermissionCommand('notifications')])
    //   .setDeactivateCommands([new RevokePermissionCommand('notifications')]),

  ]

  getFeature(f: FeatureIdent): Feature | undefined {
    const found = _.filter(this.features, (feature: Feature) => feature.ident === f)
    if (found && found.length > 0) {
      return found[0]
    }
    return undefined
  }

  getFeatures(): Feature[] {
    return this.features
  }
}
