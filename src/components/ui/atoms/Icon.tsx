import { type GetProps, styled, Text } from "@tamagui/core";
import React from "react";

const IconMap = {
	// Basic
	x: "✕",
	plus: "+",
	check: "✓",
	close: "✕",
	menu: "☰",
	more: "⋯",

	// Navigation
	"chevron-down": "⌄",
	"chevron-up": "⌃",
	"chevron-left": "‹",
	"chevron-right": "›",
	"arrow-up": "↑",
	"arrow-down": "↓",
	"arrow-left": "←",
	"arrow-right": "→",

	// Actions
	star: "★",
	heart: "♡",
	share: "⤴",
	edit: "✎",
	delete: "🗑",
	save: "💾",
	upload: "⤴",
	download: "⤵",
	filter: "⚖",
	sort: "⇅",

	// App
	user: "👤",
	settings: "⚙",
	home: "🏠",
	search: "🔍",
	bell: "🔔",
	camera: "📷",
	image: "🖼",

	// Communication
	mail: "✉",
	phone: "📞",

	// Security
	lock: "🔒",
	eye: "👁",
	"eye-off": "🙈",

	// Time & Location
	calendar: "📅",
	clock: "🕐",
	map: "🗺",

	// Content
	tag: "🏷",
	flag: "🚩",
	bookmark: "🔖",
} as const;

export type IconName = keyof typeof IconMap;

interface PSIconBaseProps {
	name: IconName;
}

export const PSIcon = styled(
	({ name, ...props }: PSIconBaseProps & GetProps<typeof Text>) => {
		const iconSymbol = IconMap[name as keyof typeof IconMap];
		return <Text {...props}>{iconSymbol}</Text>;
	},
	{
		fontSize: "$4",
		color: "$color",

		variants: {
			size: {
				1: { fontSize: "$1" },
				2: { fontSize: "$2" },
				3: { fontSize: "$3" },
				4: { fontSize: "$4" },
				5: { fontSize: "$5" },
				6: { fontSize: "$6" },
				7: { fontSize: "$7" },
				8: { fontSize: "$8" },
				small: { fontSize: "$3" },
				medium: { fontSize: "$4" },
				large: { fontSize: "$6" },
				xlarge: { fontSize: "$8" },
			},
			color: {
				primary: { color: "$primary" },
				secondary: { color: "$colorPress" },
				success: { color: "$success" },
				warning: { color: "$warning" },
				error: { color: "$error" },
				info: { color: "$info" },
				muted: { color: "$placeholderColor" },
			},
			interactive: {
				true: {
					cursor: "pointer",
					hoverStyle: {
						opacity: 0.8,
					},
					pressStyle: {
						opacity: 0.6,
					},
				},
			},
		} as const,

		defaultVariants: {
			size: "medium",
		},
	},
);

export type PSIconProps = GetProps<typeof PSIcon>;
