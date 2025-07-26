import { type GetProps, styled } from "@tamagui/core";
import { Input as TamaguiInput } from "@tamagui/input";
import React from "react";

export const Input = styled(TamaguiInput, {
	name: "PSInput",
	backgroundColor: "$background",
	borderColor: "$borderColor",
	borderWidth: 1,
	borderRadius: "$3",
	paddingHorizontal: "$3",
	paddingVertical: "$3",
	placeholderTextColor: "$placeholderColor",

	focusStyle: {
		borderColor: "$primary",
		borderWidth: 2,
		shadowColor: "$primary",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
	},

	hoverStyle: {
		borderColor: "$borderColorHover",
	},

	variants: {
		variant: {
			default: {
				backgroundColor: "$background",
				borderColor: "$borderColor",
			},
			filled: {
				backgroundColor: "$backgroundHover",
				borderColor: "transparent",
			},
			outline: {
				backgroundColor: "transparent",
				borderColor: "$borderColor",
			},
			underline: {
				backgroundColor: "transparent",
				borderWidth: 0,
				borderBottomWidth: 1,
				borderColor: "$borderColor",
				borderRadius: 0,
				focusStyle: {
					borderBottomWidth: 2,
					borderColor: "$primary",
				},
			},
		},
		size: {
			small: {
				paddingHorizontal: "$2.5",
				paddingVertical: "$2",
				fontSize: "$3",
				minHeight: 36,
			},
			medium: {
				paddingHorizontal: "$3",
				paddingVertical: "$3",
				fontSize: "$4",
				minHeight: 44,
			},
			large: {
				paddingHorizontal: "$4",
				paddingVertical: "$4",
				fontSize: "$5",
				minHeight: 52,
			},
		},
		state: {
			error: {
				borderColor: "$error",
				focusStyle: {
					borderColor: "$error",
				},
			},
			success: {
				borderColor: "$success",
				focusStyle: {
					borderColor: "$success",
				},
			},
			warning: {
				borderColor: "$warning",
				focusStyle: {
					borderColor: "$warning",
				},
			},
		},
		fullWidth: {
			true: {
				width: "100%",
			},
		},
		disabled: {
			true: {
				opacity: 0.6,
				backgroundColor: "$backgroundPress",
				color: "$colorPress",
				pointerEvents: "none",
			},
		},
	} as const,

	defaultVariants: {
		variant: "default",
		size: "medium",
	},
});

export type InputProps = GetProps<typeof Input>;
