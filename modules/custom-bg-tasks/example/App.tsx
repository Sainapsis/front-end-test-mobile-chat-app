import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CustomBgTasksModule, BackgroundTaskResult } from '../src';

export default function App() {
  const [taskResult, setTaskResult] = useState<string>('No results yet');
  const [jsCode, setJsCode] = useState<string>(
    `
    // Example of database operation in JS
    const dbResult = {
      timestamp: new Date().toISOString(),
      records: [
        { id: 1, name: 'Task 1', completed: false },
        { id: 2, name: 'Task 2', completed: true },
      ]
    };
    
    // Simulate delay as if processing database
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000);
    
    // Return the result
    return JSON.stringify(dbResult);
    `
  );

  useEffect(() => {
    // Register event listener for background task results
    const subscription = CustomBgTasksModule.addListener(
      'onBackgroundTaskCompleted',
      (result: BackgroundTaskResult) => {
        setTaskResult(
          `Task ${result.taskId} completed:\n` +
          `Success: ${result.success}\n` +
          `${result.success ? `Result: ${JSON.stringify(result.result, null, 2)}` : `Error: ${result.error}`}`
        );
      }
    );

    // Register for silent notifications
    CustomBgTasksModule.registerSilentNotificationHandler();

    return () => {
      // Cleanup
      subscription.remove();
      CustomBgTasksModule.unregisterSilentNotificationHandler();
    };
  }, []);

  const runJsInBackground = async () => {
    try {
      setTaskResult('Starting background task...');
      
      await CustomBgTasksModule.executeJsInBackground({
        taskId: `task-${Date.now()}`,
        jsCode,
        timeout: 30000,
      });
    } catch (error: any) {
      setTaskResult(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Tasks Example</Text>
      
      <Text style={styles.subtitle}>JavaScript Code to Execute:</Text>
      <TextInput
        style={styles.codeInput}
        multiline
        value={jsCode}
        onChangeText={setJsCode}
      />
      
      <Button title="Run JS in Background" onPress={runJsInBackground} />
      
      <Text style={styles.subtitle}>Result:</Text>
      <ScrollView style={styles.resultContainer}>
        <Text>{taskResult}</Text>
      </ScrollView>
      
      <Text style={styles.info}>
        To test with silent notification, send a notification with 'js_db_execution' 
        in the data payload containing JavaScript code to execute.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  codeInput: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 20,
  },
  resultContainer: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  info: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
