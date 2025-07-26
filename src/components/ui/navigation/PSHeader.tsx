import { styled, Text as TamaguiText } from "@tamagui/core";
import type React from "react";
import { View } from "react-native";

const HeaderContainer = styled(View, {
	backgroundColor: "$background",
	borderBottomWidth: 1,
	borderBottomColor: "$borderColor",
	paddingTop: "$4",
	paddingBottom: "$3",
	paddingHorizontal: "$4",
});

interface PSHeaderProps {
	title: string;
}

export const PSHeader: React.FC<PSHeaderProps> = ({ title }) => {
	return (
		<HeaderContainer>
			<TamaguiText
				fontSize="$7"
				fontWeight="600"
				color="$color"
				textAlign="center"
			>
				{title}
			</TamaguiText>
		</HeaderContainer>
	);
};
