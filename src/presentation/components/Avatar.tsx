import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { avatarFunc } from "@/src/utils/avatar.util";
import { UserStatusColors } from "@/src/presentation/constants/Colors";
import { User } from "@/src/domain/entities/user";
import { ThemedText } from "./ThemedText";

interface AvatarProps {
  user?: User;
  size?: number;
  showStatus?: boolean;
}

export function Avatar({ user, size = 40, showStatus = true }: AvatarProps) {
  const [useImage, setUseImage] = useState(true);

  const backgroundColor = avatarFunc.getAvatarColor(user?.id || user?.name);
  const initials = avatarFunc.getInitials(user?.name);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
        ]}
      >
        {user?.avatar && user.avatar !== "" && useImage && (
          <Image
            source={{ uri: user.avatar }}
            resizeMode="cover"
            onError={() => {
              setUseImage(false);
            }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        )}
        {(!useImage || user?.avatar === "") && (
          <ThemedText
            style={[
              styles.initials,
              { fontSize: size * 0.4, lineHeight: size * 0.4 },
            ]}
          >
            {initials}
          </ThemedText>
        )}
      </View>
      {showStatus && user?.status && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: UserStatusColors[user.status],
              width: size / 4,
              height: size / 4,
              borderRadius: size / 8,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "white",
    fontWeight: "bold",
    marginTop: 3,
  },
  statusIndicator: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "white",
  },
});
