
/**
 * meant for inter-submodule communication.
 *
 * We cannot use runtime messages for this, neither bex events. Submodule A can create an Event and let
 * this class dispatch it. Depending on the event name, different functions of other submodules can be
 * called.
 *
 * This class has to be implemented once-per-application if this kind of dispatch is needed.
 */
class AppEventDispatcher {

  dispatchEvent(name: string, params: object) {
    // console.debug(" >>> dispatching event", name, params)
    try {
      switch (name) {
        default:
          console.log(`unknown event ${name}`)
      }
    } catch (err) {
      console.warn("problem dispatching event: ", err)
    }
  }

}

export default new AppEventDispatcher();
