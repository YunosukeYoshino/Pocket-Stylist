import { Button as TamaguiButton } from "@tamagui/button";
import { type GetProps, styled } from "@tamagui/core";
import React from "react";

export const Button = styled(TamaguiButton, {
	name: "PSButton",
	backgroundColor: "$primary",
	borderRadius: "$4",
	fontWeight: "600",
	fontSize: "$4",
	color: "white",
	paddingHorizontal: "$4",
	paddingVertical: "$3",
	hoverStyle: {
		backgroundColor: "$primaryDark",
		scale: 1.02,
	},
	pressStyle: {
		backgroundColor: "$primaryDark",
		scale: 0.98,
	},
	focusStyle: {
		borderColor: "$borderColorFocus",
		borderWidth: 2,
	},

	variants: {
		variant: {
			primary: {
				backgroundColor: "$primary",
				color: "white",
				hoverStyle: {
					backgroundColor: "$primaryDark",
				},
			},
			secondary: {
				backgroundColor: "$secondary",
				color: "$primary",
				borderColor: "$primary",
				borderWidth: 1,
				hoverStyle: {
					backgroundColor: "$primaryLight",
					color: "white",
				},
			},
			outline: {
				backgroundColor: "transparent",
				color: "$primary",
				borderColor: "$primary",
				borderWidth: 1,
				hoverStyle: {
					backgroundColor: "$primary",
					color: "white",
				},
			},
			ghost: {
				backgroundColor: "transparent",
				color: "$primary",
				hoverStyle: {
					backgroundColor: "$primaryLight",
					color: "white",
				},
			},
			success: {
				backgroundColor: "$success",
				color: "white",
				hoverStyle: {
					backgroundColor: "$successDark",
				},
			},
			warning: {
				backgroundColor: "$warning",
				color: "$colorInverse",
				hoverStyle: {
					backgroundColor: "$warningDark",
				},
			},
			error: {
				backgroundColor: "$error",
				color: "white",
				hoverStyle: {
					backgroundColor: "$errorDark",
				},
			},
		},
		size: {
			small: {
				paddingHorizontal: "$3",
				paddingVertical: "$2",
				fontSize: "$3",
			},
			medium: {
				paddingHorizontal: "$4",
				paddingVertical: "$3",
				fontSize: "$4",
			},
			large: {
				paddingHorizontal: "$6",
				paddingVertical: "$4",
				fontSize: "$5",
			},
		},
		fullWidth: {
			true: {
				width: "100%",
			},
		},
		disabled: {
			true: {
				opacity: 0.5,
				pointerEvents: "none",
			},
		},
	} as const,

	defaultVariants: {
		variant: "primary",
		size: "medium",
	},
});

export type ButtonProps = GetProps<typeof Button>;
