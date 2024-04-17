import {useDB} from "src/services/usePersistenceService";
import {Tab} from "src/models/Tab";
import backendApi from "src/services/BackendApi";
import {BlobType, SavedBlob} from "src/models/SavedBlob";
import _ from "lodash"

const {db} = useDB()

class PdfService {

    /**
     * Init, called when extension is loaded (via App.vue)
     */
    async init() {
        console.debug("init mhtmlService")
    }


    convertFrom(html: string) {
        return backendApi.createPdf(html)
    }

    screenshotFrom(html: string) {
        return backendApi.createPng(html)
    }

    saveBlob(tab: Tab, data: Blob, type: BlobType, remark: string | undefined = undefined): Promise<any> {
        return db.saveBlob(tab.id, tab.url || '', data, type, remark)
    }

    getPdfs() {
        return db.getBlobs(BlobType.PDF)
    }

    getPngs() {
        return db.getBlobs(BlobType.PNG)
    }

    async getPngsForTab(tabId: string) {
        const blobs = await db.getBlobsForTab(tabId)
        //console.log("got blobs", blobs)
        return _.filter(blobs, (b: SavedBlob) => b.type === BlobType.PNG)
    }

    async getPdfsForTab(tabId: string) {
        const blobs = await db.getBlobsForTab(tabId)
        return _.filter(blobs, (b: SavedBlob) => b.type === BlobType.PDF)
    }

    deleteBlob(tabId: string, elementId: string) {
        console.log("deleting blob", tabId, elementId)
        db.deleteBlob(tabId, elementId)
    }
}

export default new PdfService();
