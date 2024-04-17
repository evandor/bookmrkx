export enum MonitoringType {
    NONE = "NONE",
    CONTENT_HASH = "CONTENT_HASH"
}

export class Monitor {

    constructor(
        public type: MonitoringType = MonitoringType.NONE,
        public data: object = {}) {
    }
}
