export enum BlobType {
    PNG = "PNG",
    PDF = "PDF"
}

export class SavedBlob {
    created: number

    constructor(public id: string, public type: BlobType, public url: string, public content: Blob, public remark: string | undefined = undefined) {
        this.created = new Date().getTime()
    }

}
