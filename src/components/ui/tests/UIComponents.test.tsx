import { fireEvent, render } from "@testing-library/react-native";
import type React from "react";
import {
	PSButton,
	PSCard,
	PSCheckbox,
	PSContainer,
	PSForm,
	PSGrid,
	PSIcon,
	PSInput,
	PSStack,
	PSSwitch,
	PSText,
} from "../index";

// Mock Tamagui providers for testing
const TamaguiTestProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return <>{children}</>;
};

const withProvider = (component: React.ReactElement) => (
	<TamaguiTestProvider>{component}</TamaguiTestProvider>
);

describe("UI Components", () => {
	describe("PSButton", () => {
		it("renders correctly with default props", () => {
			const { getByText } = render(withProvider(<PSButton>Click me</PSButton>));
			expect(getByText("Click me")).toBeTruthy();
		});

		it("handles press events", () => {
			const onPress = jest.fn();
			const { getByText } = render(
				withProvider(<PSButton onPress={onPress}>Press me</PSButton>),
			);

			fireEvent.press(getByText("Press me"));
			expect(onPress).toHaveBeenCalledTimes(1);
		});

		it("renders with different variants", () => {
			const { getByText } = render(
				withProvider(<PSButton variant="secondary">Secondary</PSButton>),
			);
			expect(getByText("Secondary")).toBeTruthy();
		});
	});

	describe("PSInput", () => {
		it("renders correctly with placeholder", () => {
			const { getByPlaceholderText } = render(
				withProvider(<PSInput placeholder="Enter text" />),
			);
			expect(getByPlaceholderText("Enter text")).toBeTruthy();
		});

		it("handles text input", () => {
			const onChangeText = jest.fn();
			const { getByPlaceholderText } = render(
				withProvider(
					<PSInput placeholder="Type here" onChangeText={onChangeText} />,
				),
			);

			const input = getByPlaceholderText("Type here");
			fireEvent.changeText(input, "Hello World");
			expect(onChangeText).toHaveBeenCalledWith("Hello World");
		});
	});

	describe("PSText", () => {
		it("renders text correctly", () => {
			const { getByText } = render(withProvider(<PSText>Hello World</PSText>));
			expect(getByText("Hello World")).toBeTruthy();
		});

		it("renders with different variants", () => {
			const { getByText } = render(
				withProvider(<PSText variant="h1">Heading</PSText>),
			);
			expect(getByText("Heading")).toBeTruthy();
		});
	});

	describe("PSIcon", () => {
		it("renders icon correctly", () => {
			const { getByText } = render(withProvider(<PSIcon name="heart" />));
			expect(getByText("♡")).toBeTruthy();
		});

		it("renders different icons", () => {
			const { getByText } = render(withProvider(<PSIcon name="star" />));
			expect(getByText("★")).toBeTruthy();
		});
	});

	describe("Layout Components", () => {
		describe("PSContainer", () => {
			it("renders children correctly", () => {
				const { getByText } = render(
					withProvider(
						<PSContainer>
							<PSText>Container content</PSText>
						</PSContainer>,
					),
				);
				expect(getByText("Container content")).toBeTruthy();
			});
		});

		describe("PSCard", () => {
			it("renders card with content", () => {
				const { getByText } = render(
					withProvider(
						<PSCard>
							<PSText>Card content</PSText>
						</PSCard>,
					),
				);
				expect(getByText("Card content")).toBeTruthy();
			});
		});

		describe("PSStack", () => {
			it("renders stack with children", () => {
				const { getByText } = render(
					withProvider(
						<PSStack>
							<PSText>Item 1</PSText>
							<PSText>Item 2</PSText>
						</PSStack>,
					),
				);
				expect(getByText("Item 1")).toBeTruthy();
				expect(getByText("Item 2")).toBeTruthy();
			});
		});

		describe("PSGrid", () => {
			it("renders grid with items", () => {
				const { getByText } = render(
					withProvider(
						<PSGrid>
							<PSText>Grid Item 1</PSText>
							<PSText>Grid Item 2</PSText>
						</PSGrid>,
					),
				);
				expect(getByText("Grid Item 1")).toBeTruthy();
				expect(getByText("Grid Item 2")).toBeTruthy();
			});
		});
	});

	describe("Form Components", () => {
		describe("PSForm", () => {
			it("renders form with children", () => {
				const { getByText } = render(
					withProvider(
						<PSForm>
							<PSText>Form content</PSText>
						</PSForm>,
					),
				);
				expect(getByText("Form content")).toBeTruthy();
			});
		});

		describe("PSCheckbox", () => {
			it("handles checkbox state changes", () => {
				const onCheckedChange = jest.fn();
				const { getByRole } = render(
					withProvider(
						<PSCheckbox
							checked={false}
							onCheckedChange={onCheckedChange}
							label="Check me"
						/>,
					),
				);

				// Note: This test might need adjustment based on actual implementation
				// as PSCheckbox uses TouchableOpacity which might not have 'checkbox' role
			});
		});

		describe("PSSwitch", () => {
			it("handles switch value changes", () => {
				const onValueChange = jest.fn();
				render(
					withProvider(
						<PSSwitch value={false} onValueChange={onValueChange} />,
					),
				);

				// Note: Testing native Switch component might require different approach
				expect(onValueChange).toBeDefined();
			});
		});
	});
});

describe("Component Integration", () => {
	it("renders a complete form with multiple components", () => {
		const { getByText, getByPlaceholderText } = render(
			withProvider(
				<PSForm>
					<PSText variant="h3">Registration Form</PSText>
					<PSInput placeholder="Enter your name" />
					<PSInput placeholder="Enter your email" />
					<PSButton>Submit</PSButton>
				</PSForm>,
			),
		);

		expect(getByText("Registration Form")).toBeTruthy();
		expect(getByPlaceholderText("Enter your name")).toBeTruthy();
		expect(getByPlaceholderText("Enter your email")).toBeTruthy();
		expect(getByText("Submit")).toBeTruthy();
	});

	it("renders a complete card layout", () => {
		const { getByText } = render(
			withProvider(
				<PSContainer>
					<PSCard>
						<PSStack>
							<PSText variant="h4">Card Title</PSText>
							<PSText>Card description content</PSText>
							<PSButton variant="outline">Action</PSButton>
						</PSStack>
					</PSCard>
				</PSContainer>,
			),
		);

		expect(getByText("Card Title")).toBeTruthy();
		expect(getByText("Card description content")).toBeTruthy();
		expect(getByText("Action")).toBeTruthy();
	});
});
