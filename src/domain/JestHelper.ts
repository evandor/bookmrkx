export function useJestHelper() {

  const dbInit = async function (request:any) {
    const db = request.result;
    //tabsetsDbStore =
    db.createObjectStore("tabsets");
    db.createObjectStore("tabs");
    db.createObjectStore("content");
    db.createObjectStore("thumbnails");
    db.createObjectStore("mhtml");
    db.createObjectStore("notifications");
    db.createObjectStore("suggestions");
    db.createObjectStore("spaces");
    db.createObjectStore("groups");
    db.createObjectStore("windows");
    db.createObjectStore("logs", { autoIncrement: true });
    // store.createIndex("by_title", "title", {unique: true});
    // store.put({title: "Quarry Memories", author: "Fred", isbn: 123456});
    //IndexedDbPersistenceService.init();
  }



  return {
    dbInit
  }
}
