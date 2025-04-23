import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSync } from "../hooks/useSync";
import { Ionicons } from "@expo/vector-icons";

interface SyncStatusProps {
  showDetails?: boolean;
}

export default function SyncStatus({ showDetails = false }: SyncStatusProps) {
  const {
    isOnline,
    lastSyncTimestamp,
    pendingOperationsCount,
    syncInProgress,
    syncWithServer,
  } = useSync();

  const formatTimestamp = (timestamp: number) => {
    if (timestamp === 0) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const handleSync = async () => {
    if (!syncInProgress && isOnline) {
      await syncWithServer();
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return "#cc0000";
    if (pendingOperationsCount > 0) return "#ff9900";
    return "#00cc00";
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <Text style={styles.statusText}>
          {!isOnline
            ? "Offline"
            : pendingOperationsCount > 0
            ? `${pendingOperationsCount} pending changes`
            : "Synced"}
        </Text>
        {syncInProgress ? (
          <ActivityIndicator size="small" color="#0000ff" style={styles.icon} />
        ) : (
          <TouchableOpacity
            onPress={handleSync}
            disabled={!isOnline || syncInProgress}
            style={[
              styles.syncButton,
              (!isOnline || syncInProgress) && styles.disabledButton,
            ]}
          >
            <Ionicons
              name="sync"
              size={16}
              color={!isOnline ? "#999" : "#fff"}
            />
          </TouchableOpacity>
        )}
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>
            Network: {isOnline ? "Online" : "Offline"}
          </Text>
          <Text style={styles.detailText}>
            Last sync: {formatTimestamp(lastSyncTimestamp)}
          </Text>
          <Text style={styles.detailText}>
            Pending operations: {pendingOperationsCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginVertical: 5,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    flex: 1,
  },
  icon: {
    marginLeft: 8,
  },
  syncButton: {
    backgroundColor: "#007AFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  detailsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
});
