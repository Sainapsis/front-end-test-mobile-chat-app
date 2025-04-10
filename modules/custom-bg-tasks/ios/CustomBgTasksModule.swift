import ExpoModulesCore
import UserNotifications
import JavaScriptCore

public class CustomBgTasksModule: Module {
  private var runningTasks = [String: Bool]()
  private var jsContext: JSContext?
  private var isNotificationObserverRegistered = false
  
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CustomBgTasks')` in JavaScript.
    Name("CustomBgTasks")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange", "onBackgroundTaskCompleted")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }
    
    AsyncFunction("executeJsInBackground") { (options: [String: Any], promise: Promise) in
      guard let jsCode = options["jsCode"] as? String else {
        promise.reject(CustomBgTasksError.missingJsCode)
        return
      }
      
      let taskId = options["taskId"] as? String ?? UUID().uuidString
      let timeout = options["timeout"] as? TimeInterval ?? 30
      let persistence = options["persistence"] as? Bool ?? false
      
      self.executeJavaScriptInBackground(taskId: taskId, jsCode: jsCode, timeout: timeout, persistence: persistence, promise: promise)
    }
    
    AsyncFunction("registerSilentNotificationHandler") { (promise: Promise) in
      do {
        try self.registerSilentNotificationObserver()
        promise.resolve(nil)
      } catch {
        promise.reject(error)
      }
    }
    
    AsyncFunction("unregisterSilentNotificationHandler") { (promise: Promise) in
      self.unregisterSilentNotificationObserver()
      promise.resolve(nil)
    }
    
    AsyncFunction("isBackgroundTaskRunning") { (taskId: String, promise: Promise) in
      promise.resolve(self.runningTasks[taskId] != nil)
    }
    
    AsyncFunction("stopBackgroundTask") { (taskId: String, promise: Promise) in
      let wasRunning = self.runningTasks.removeValue(forKey: taskId) != nil
      promise.resolve(wasRunning)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(CustomBgTasksView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: CustomBgTasksView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
  
  private func executeJavaScriptInBackground(taskId: String, jsCode: String, timeout: TimeInterval, persistence: Bool, promise: Promise) {
    guard runningTasks[taskId] == nil else {
      promise.reject(CustomBgTasksError.taskAlreadyRunning(taskId: taskId))
      return
    }
    
    runningTasks[taskId] = true
    promise.resolve(taskId)
    
    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else { return }
      
      NSLog("[CustomBgTasks] Executing background task: \(taskId)")
      
      do {
        let jsResult = try self.evaluateJavaScript(jsCode)
        self.runningTasks.removeValue(forKey: taskId)
        
        DispatchQueue.main.async {
          self.sendEvent("onBackgroundTaskCompleted", [
            "taskId": taskId,
            "success": true,
            "result": jsResult
          ])
        }
      } catch {
        self.runningTasks.removeValue(forKey: taskId)
        NSLog("[CustomBgTasks] Error executing background task \(taskId): \(error.localizedDescription)")
        
        DispatchQueue.main.async {
          self.sendEvent("onBackgroundTaskCompleted", [
            "taskId": taskId,
            "success": false,
            "error": error.localizedDescription
          ])
        }
      }
    }
  }
  
  private func evaluateJavaScript(_ jsCode: String) throws -> Any {
    if jsContext == nil {
      jsContext = JSContext()
      
      let console = JSObject()
      console.setProperty("log", callback: { args in
        guard let args = args else { return }
        let message = args.joined(separator: " ")
        NSLog("[JSConsole] \(message)")
      })
      
      jsContext?.setObject(console, forKeyedSubscript: "console" as NSString)
    }
    
    guard let jsContext = jsContext else {
      throw CustomBgTasksError.jsContextCreationFailed
    }
    
    let result = jsContext.evaluateScript(jsCode)
    if let exception = jsContext.exception {
      throw CustomBgTasksError.jsEvaluationFailed(message: exception.toString())
    }
    
    if let result = result {
      return result.toObject()
    }
    
    return NSNull()
  }
  
  private func registerSilentNotificationObserver() throws {
    guard !isNotificationObserverRegistered else { return }
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleSilentNotification(_:)),
      name: NSNotification.Name("RNFirebaseMessagingReceived"),
      object: nil
    )
    
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleSilentNotification(_:)),
      name: NSNotification.Name("NotifeeMessagingReceived"),
      object: nil
    )
    
    isNotificationObserverRegistered = true
    NSLog("[CustomBgTasks] Silent notification observer registered")
  }
  
  private func unregisterSilentNotificationObserver() {
    guard isNotificationObserverRegistered else { return }
    
    NotificationCenter.default.removeObserver(
      self,
      name: NSNotification.Name("RNFirebaseMessagingReceived"),
      object: nil
    )
    
    NotificationCenter.default.removeObserver(
      self,
      name: NSNotification.Name("NotifeeMessagingReceived"),
      object: nil
    )
    
    isNotificationObserverRegistered = false
    NSLog("[CustomBgTasks] Silent notification observer unregistered")
  }
  
  @objc private func handleSilentNotification(_ notification: Notification) {
    guard let userInfo = notification.userInfo as? [String: Any] else { return }
    
    let isDataOnly = userInfo["contentAvailable"] as? Bool == true || 
                    (userInfo["notification"] == nil && userInfo["aps"] as? [String: Any]?)?["alert"] == nil
    
    guard isDataOnly, let jsDbExecution = userInfo["js_db_execution"] as? String else { return }
    
    let taskId = UUID().uuidString
    NSLog("[CustomBgTasks] Processing silent notification with DB execution: \(taskId)")
    
    executeJavaScriptInBackground(
      taskId: taskId,
      jsCode: jsDbExecution,
      timeout: 30,
      persistence: false,
      promise: Promise()
    )
  }
}

enum CustomBgTasksError: Error {
  case missingJsCode
  case taskAlreadyRunning(taskId: String)
  case jsContextCreationFailed
  case jsEvaluationFailed(message: String)
}

extension CustomBgTasksError: LocalizedError {
  var errorDescription: String? {
    switch self {
    case .missingJsCode:
      return "JavaScript code is required"
    case .taskAlreadyRunning(let taskId):
      return "A task with ID \(taskId) is already running"
    case .jsContextCreationFailed:
      return "Failed to create JavaScript context"
    case .jsEvaluationFailed(let message):
      return "JavaScript evaluation failed: \(message)"
    }
  }
}

class JSObject: NSObject {
  private var callbacks = [String: ([String]?) -> Void]()
  
  func setProperty(_ name: String, callback: @escaping ([String]?) -> Void) {
    callbacks[name] = callback
  }
  
  @objc func callAsFunction(_ functionName: String, withArguments args: [Any]?) -> Any? {
    guard let callback = callbacks[functionName] else { return nil }
    
    let stringArgs = args?.compactMap { arg -> String? in
      if let arg = arg as? String {
        return arg
      } else if let data = try? JSONSerialization.data(withJSONObject: arg, options: []),
                let json = String(data: data, encoding: .utf8) {
        return json
      } else {
        return String(describing: arg)
      }
    }
    
    callback(stringArgs)
    return nil
  }
}
