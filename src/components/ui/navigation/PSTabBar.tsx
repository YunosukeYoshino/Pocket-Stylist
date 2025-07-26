import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { styled, Text as TamaguiText } from "@tamagui/core";
import type React from "react";
import { TouchableOpacity, View } from "react-native";

const TabBarContainer = styled(View, {
	flexDirection: "row",
	backgroundColor: "$background",
	borderTopWidth: 1,
	borderTopColor: "$borderColor",
	paddingBottom: "$2",
	paddingTop: "$2",
	paddingHorizontal: "$2",
});

const TabBarItem = styled(TouchableOpacity, {
	flex: 1,
	alignItems: "center",
	justifyContent: "center",
	paddingVertical: "$2",
});

export const PSTabBar: React.FC<BottomTabBarProps> = ({
	state,
	descriptors,
	navigation,
}) => {
	return (
		<TabBarContainer>
			{state.routes.map((route, index) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: "tabPress",
						target: route.key,
						canPreventDefault: true,
					});

					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name, route.params);
					}
				};

				const onLongPress = () => {
					navigation.emit({
						type: "tabLongPress",
						target: route.key,
					});
				};

				return (
					<TabBarItem
						key={route.key}
						accessibilityRole="button"
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarButtonTestID}
						onPress={onPress}
						onLongPress={onLongPress}
					>
						<TamaguiText fontSize="$6" marginBottom="$1">
							{typeof options.tabBarIcon === "function"
								? options.tabBarIcon({
										focused: isFocused,
										color: isFocused ? "#E14F5A" : "#666",
										size: 24,
									})
								: options.tabBarIcon}
						</TamaguiText>
						<TamaguiText
							fontSize="$2"
							color={isFocused ? "#E14F5A" : "#666"}
							fontWeight={isFocused ? "600" : "400"}
						>
							{label as string}
						</TamaguiText>
					</TabBarItem>
				);
			})}
		</TabBarContainer>
	);
};
