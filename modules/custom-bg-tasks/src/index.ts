// Export the BackgroundDBHandler as the main API
import BackgroundDBHandler from './BackgroundDBHandler';

// Export other components for completeness
import { CustomBgTasksViewProps, BackgroundTaskOptions, BackgroundTaskResult } from './CustomBgTasks.types';
import CustomBgTasksView from './CustomBgTasksView';

// Log that the module has been loaded
console.log('[custom-bg-tasks] Module loaded successfully');

// Exports
export { CustomBgTasksView };
export { BackgroundTaskOptions, BackgroundTaskResult };
export type { CustomBgTasksViewProps };
export { BackgroundDBHandler };

// For default import
export default BackgroundDBHandler;
