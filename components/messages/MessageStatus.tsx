import { MESSAGE_STATUS, STATUS_ICONS } from "@/constants/messageStatus";
import { IconSymbol } from "../ui/IconSymbol";

export type MessageStatus = typeof MESSAGE_STATUS[keyof typeof MESSAGE_STATUS]

export interface StatusIconConfig {
    name: string;
    size: number;
    colors:{
        light: string;
        dark: string;
    }
}

interface MessageStatusProps {
    status: MessageStatus;
    isDark: boolean;
    
}

export function MessageStatusIcon({status, isDark}: MessageStatusProps) {
    const iconConfig = STATUS_ICONS[status];

    return (
        <IconSymbol 
        name={iconConfig.name}
        size={iconConfig.size}
        color={isDark
            ? iconConfig.colors.dark
            : iconConfig.colors.light
        }
        />
    )
}