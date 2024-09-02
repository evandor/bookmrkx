import {SidePanelViews} from "src/models/SidePanelViews";

export class SidePanel {

  relevantViews: SidePanelViews[] = []

  constructor(
    public activeView: SidePanelViews = SidePanelViews.MAIN) {
    this.relevantViews.push(SidePanelViews.BOOKMARKS)
  }

  public enabledViewsCount() {
    let count = 0
    for (const v of this.relevantViews) {
      if (v.showButtonFunction.apply(this)) {
        count += 1
      }
    }
    return count
  }
}
