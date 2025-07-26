import { type GetProps, styled } from "@tamagui/core";
import React from "react";
import { type ImageSourcePropType, Image as RNImage } from "react-native";

export const PSImage = styled(RNImage, {
	name: "PSImage",

	variants: {
		size: {
			xs: { width: 32, height: 32 },
			sm: { width: 48, height: 48 },
			md: { width: 64, height: 64 },
			lg: { width: 96, height: 96 },
			xl: { width: 128, height: 128 },
			"2xl": { width: 192, height: 192 },
			"3xl": { width: 256, height: 256 },
			full: { width: "100%", height: "100%" },
		},
		aspectRatio: {
			square: { aspectRatio: 1 },
			portrait: { aspectRatio: 3 / 4 },
			landscape: { aspectRatio: 4 / 3 },
			wide: { aspectRatio: 16 / 9 },
		},
		rounded: {
			none: { borderRadius: 0 },
			sm: { borderRadius: "$2" },
			md: { borderRadius: "$3" },
			lg: { borderRadius: "$4" },
			xl: { borderRadius: "$6" },
			full: { borderRadius: 9999 },
		},
		resizeMode: {
			cover: { resizeMode: "cover" },
			contain: { resizeMode: "contain" },
			stretch: { resizeMode: "stretch" },
			repeat: { resizeMode: "repeat" },
			center: { resizeMode: "center" },
		},
		bordered: {
			true: {
				borderWidth: 1,
				borderColor: "$borderColor",
			},
		},
		shadow: {
			sm: {
				shadowColor: "$shadowColor",
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.1,
				shadowRadius: 2,
				elevation: 1,
			},
			md: {
				shadowColor: "$shadowColor",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.15,
				shadowRadius: 4,
				elevation: 3,
			},
			lg: {
				shadowColor: "$shadowColor",
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.2,
				shadowRadius: 8,
				elevation: 5,
			},
		},
		loading: {
			true: {
				opacity: 0.6,
				backgroundColor: "$backgroundHover",
			},
		},
	} as const,

	defaultVariants: {
		size: "md",
		rounded: "md",
		resizeMode: "cover",
	},
});

export interface PSImageProps extends GetProps<typeof PSImage> {
	source: ImageSourcePropType;
	fallback?: React.ReactNode;
	onError?: () => void;
	onLoad?: () => void;
}

export const PSImageWithFallback: React.FC<PSImageProps> = ({
	source,
	fallback = null,
	onError,
	onLoad,
	...props
}) => {
	const [hasError, setHasError] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(true);

	const handleError = React.useCallback(() => {
		setHasError(true);
		setIsLoading(false);
		onError?.();
	}, [onError]);

	const handleLoad = React.useCallback(() => {
		setIsLoading(false);
		onLoad?.();
	}, [onLoad]);

	if (hasError && fallback) {
		return <>{fallback}</>;
	}

	return (
		<PSImage
			source={source}
			onError={handleError}
			onLoad={handleLoad}
			loading={isLoading}
			{...props}
		/>
	);
};
