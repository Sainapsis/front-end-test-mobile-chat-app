import { Button, View } from "react-native";
import { resetDatabase } from "@/scripts/resetDB";

export function DevTools() {
  const handleReset = async () => {
    try {
      await resetDatabase();
      alert("Database reset successfully!");
    } catch (error) {
      console.error("Error resetting database:", error);
      alert("Error resetting database");
    }
  };

  return (
    <View>
      <Button title="Reset Database" onPress={handleReset} />
    </View>
  );
}
