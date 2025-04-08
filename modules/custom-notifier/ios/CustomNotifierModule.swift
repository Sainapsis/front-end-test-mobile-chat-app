import ExpoModulesCore
import UserNotifications

public class CustomNotifierModule: Module, UNUserNotificationCenterDelegate {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CustomNotifier')` in JavaScript.
    Name("CustomNotifier")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onNotificationReceived", "onNotificationPressed")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("requestPermissions") { () -> Promise in
      Promise { promise in
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
          if let error = error {
            promise.reject("PERMISSION_ERROR", error.localizedDescription)
            return
          }
          promise.resolve(granted)
        }
      }
    }

    AsyncFunction("checkPermissions") { () -> Promise in
      Promise { promise in
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
          promise.resolve(settings.authorizationStatus == .authorized)
        }
      }
    }

    AsyncFunction("showNotification") { (options: [String: Any]) -> Promise in
      Promise { promise in
        let content = UNMutableNotificationContent()
        content.title = options["title"] as? String ?? ""
        content.body = options["body"] as? String ?? ""
        
        if let data = options["data"] as? [String: Any] {
          content.userInfo = data
        }

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let identifier = UUID().uuidString
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { error in
          if let error = error {
            promise.reject("NOTIFICATION_ERROR", error.localizedDescription)
            return
          }
          
          var eventData: [String: Any] = [
            "notificationId": identifier,
            "action": "received"
          ]
          if let data = content.userInfo as? [String: Any] {
            eventData["data"] = data
          }
          self.sendEvent("onNotificationReceived", eventData)
          
          promise.resolve(identifier)
        }
      }
    }

    AsyncFunction("cancelNotification") { (id: String) -> Promise in
      Promise { promise in
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [id])
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: [id])
        promise.resolve(nil)
      }
    }

    AsyncFunction("cancelAllNotifications") { () -> Promise in
      Promise { promise in
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        promise.resolve(nil)
      }
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(CustomNotifierView.self) {
      // Defines a setter for the `url`
    }

    OnCreate {
      UNUserNotificationCenter.current().delegate = self
    }
  }

  // UNUserNotificationCenterDelegate methods
  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    var eventData: [String: Any] = [
        "notificationId": notification.request.identifier,
        "action": "received"
    ]
    if let data = notification.request.content.userInfo as? [String: Any] {
        eventData["data"] = data
    }
    self.sendEvent("onNotificationReceived", eventData)
    
    completionHandler([.banner, .sound, .badge])
  }

  public func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    var eventData: [String: Any] = [
        "notificationId": response.notification.request.identifier,
        "action": "pressed"
    ]
    if let data = response.notification.request.content.userInfo as? [String: Any] {
        eventData["data"] = data
    }
    self.sendEvent("onNotificationPressed", eventData)
    
    completionHandler()
  }
}