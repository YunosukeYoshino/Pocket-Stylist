import { type GetProps, styled } from "@tamagui/core";
import React from "react";
import { Text as RNText } from "react-native";

export const Text = styled(RNText, {
	name: "PSText",

	variants: {
		variant: {
			h1: {
				fontSize: "$10",
				fontWeight: "700",
				lineHeight: "$10",
				color: "$color",
			},
			h2: {
				fontSize: "$9",
				fontWeight: "700",
				lineHeight: "$9",
				color: "$color",
			},
			h3: {
				fontSize: "$8",
				fontWeight: "600",
				lineHeight: "$8",
				color: "$color",
			},
			h4: {
				fontSize: "$7",
				fontWeight: "600",
				lineHeight: "$7",
				color: "$color",
			},
			h5: {
				fontSize: "$6",
				fontWeight: "600",
				lineHeight: "$6",
				color: "$color",
			},
			h6: {
				fontSize: "$5",
				fontWeight: "600",
				lineHeight: "$5",
				color: "$color",
			},
			body1: {
				fontSize: "$4",
				fontWeight: "400",
				lineHeight: "$4",
				color: "$color",
			},
			body2: {
				fontSize: "$3",
				fontWeight: "400",
				lineHeight: "$3",
				color: "$color",
			},
			caption: {
				fontSize: "$2",
				fontWeight: "400",
				lineHeight: "$2",
				color: "$colorPress",
			},
			label: {
				fontSize: "$3",
				fontWeight: "500",
				lineHeight: "$3",
				color: "$color",
			},
			overline: {
				fontSize: "$2",
				fontWeight: "400",
				lineHeight: "$2",
				color: "$colorPress",
				textTransform: "uppercase",
				letterSpacing: 1.5,
			},
		},
		size: {
			1: { fontSize: "$1", lineHeight: "$1" },
			2: { fontSize: "$2", lineHeight: "$2" },
			3: { fontSize: "$3", lineHeight: "$3" },
			4: { fontSize: "$4", lineHeight: "$4" },
			5: { fontSize: "$5", lineHeight: "$5" },
			6: { fontSize: "$6", lineHeight: "$6" },
			7: { fontSize: "$7", lineHeight: "$7" },
			8: { fontSize: "$8", lineHeight: "$8" },
			9: { fontSize: "$9", lineHeight: "$9" },
			10: { fontSize: "$10", lineHeight: "$10" },
		},
		weight: {
			1: { fontWeight: "300" },
			2: { fontWeight: "400" },
			3: { fontWeight: "500" },
			4: { fontWeight: "600" },
			5: { fontWeight: "700" },
			6: { fontWeight: "800" },
			7: { fontWeight: "900" },
		},
		color: {
			primary: { color: "$primary" },
			secondary: { color: "$colorPress" },
			success: { color: "$success" },
			warning: { color: "$warning" },
			error: { color: "$error" },
			info: { color: "$info" },
		},
		align: {
			left: { textAlign: "left" },
			center: { textAlign: "center" },
			right: { textAlign: "right" },
			justify: { textAlign: "justify" },
		},
	} as const,

	defaultVariants: {
		variant: "body1",
	},
});

export type TextProps = GetProps<typeof Text>;
