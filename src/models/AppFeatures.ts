import _ from "lodash"
import {AppFeature, FeatureIdent, FeatureType} from "src/models/AppFeature"

export class AppFeatures {
  features: AppFeature[] = [
    new AppFeature(FeatureIdent.WINDOWS_MANAGEMENT, FeatureType.RECOMMENDED, 'Windows Management', 'grid_view', ['bex']),
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

  getFeature(f: FeatureIdent): AppFeature | undefined {
    const found = _.filter(this.features, (feature: AppFeature) => feature.ident === f)
    if (found && found.length > 0) {
      return found[0]
    }
    return undefined
  }

  getFeatures(): AppFeature[] {
    return this.features
  }
}
