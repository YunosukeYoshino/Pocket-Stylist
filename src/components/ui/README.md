# Pocket Stylist UI Component Library

A comprehensive, reusable UI component library built with Tamagui v3 for the Pocket Stylist application. All components follow a consistent design system with the `PS` prefix and support theming, accessibility, and TypeScript.

## 🎨 Design System

- **Primary Brand Color**: `#E14F5A` (red-pink)
- **Base Framework**: Tamagui v3 primitives
- **Styling**: Tamagui styled components with theme tokens
- **Typography**: Consistent scale with Tamagui's typography system
- **Spacing**: Token-based spacing system ($1, $2, $3, etc.)

## 📦 Components Overview

### Atoms (Basic Components)

#### PSButton
Versatile button component with multiple variants and states.

```tsx
import { PSButton } from '@/components/ui'

<PSButton variant="primary" size="medium" onPress={handlePress}>
  Click Me
</PSButton>

<PSButton variant="outline" size="large" disabled>
  Disabled Button
</PSButton>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `success`, `warning`, `error`
**Sizes**: `small`, `medium`, `large`

#### PSInput
Form input component with validation states and multiple variants.

```tsx
import { PSInput } from '@/components/ui'

<PSInput 
  placeholder="Enter your email"
  variant="default"
  size="medium"
  state="error"
/>

<PSInput 
  variant="underline"
  placeholder="Underline style"
  fullWidth
/>
```

**Variants**: `default`, `filled`, `outline`, `underline`
**States**: `error`, `success`, `warning`
**Sizes**: `small`, `medium`, `large`

#### PSText
Typography component with semantic variants and comprehensive styling options.

```tsx
import { PSText } from '@/components/ui'

<PSText variant="h1">Main Heading</PSText>
<PSText variant="body1" color="primary">
  Primary colored body text
</PSText>
<PSText variant="caption" align="center">
  Centered caption text
</PSText>
```

**Variants**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `body1`, `body2`, `caption`, `label`, `overline`
**Colors**: `primary`, `secondary`, `success`, `warning`, `error`, `info`

#### PSIcon
Icon component using Unicode symbols with consistent sizing and theming.

```tsx
import { PSIcon } from '@/components/ui'

<PSIcon name="heart" size="medium" color="primary" />
<PSIcon name="star" size="large" interactive />
<PSIcon name="chevron-right" size="small" />
```

**Available Icons**: `heart`, `star`, `user`, `home`, `search`, `settings`, `camera`, etc.
**Sizes**: `small`, `medium`, `large`, `xlarge`, or numeric (`1`-`8`)
**Colors**: `primary`, `secondary`, `success`, `warning`, `error`, `info`, `muted`

#### PSImage
Image component with fallback support, loading states, and flexible sizing.

```tsx
import { PSImage, PSImageWithFallback } from '@/components/ui'

<PSImage 
  source={{ uri: 'https://example.com/image.jpg' }}
  size="lg"
  rounded="md"
  shadow="sm"
/>

<PSImageWithFallback
  source={{ uri: 'https://example.com/image.jpg' }}
  fallback={<PSText>Image not found</PSText>}
  onError={() => console.log('Failed to load')}
/>
```

**Sizes**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`
**Aspect Ratios**: `square`, `portrait`, `landscape`, `wide`

### Layout Components

#### PSContainer
Main container component with flexible spacing and layout options.

```tsx
import { PSContainer } from '@/components/ui'

<PSContainer centered safe spacing="lg">
  <PSText>Centered content with safe area</PSText>
</PSContainer>
```

#### PSStack
Flexible stack layout for vertical or horizontal arrangements.

```tsx
import { PSStack } from '@/components/ui'

<PSStack direction="vertical" spacing="md" align="center">
  <PSText>Item 1</PSText>
  <PSText>Item 2</PSText>
  <PSText>Item 3</PSText>
</PSStack>
```

**Directions**: `vertical`, `horizontal`
**Alignment**: `start`, `center`, `end`, `stretch`
**Justification**: `start`, `center`, `end`, `between`, `around`, `evenly`

#### PSCard
Card component with elevation, variants, and interactive states.

```tsx
import { PSCard } from '@/components/ui'

<PSCard variant="elevated" padding="lg" pressable>
  <PSText variant="h4">Card Title</PSText>
  <PSText>Card content goes here</PSText>
</PSCard>
```

**Variants**: `elevated`, `outlined`, `filled`
**Padding**: `none`, `sm`, `md`, `lg`

#### PSGrid & PSGridItem
Grid layout system for responsive layouts.

```tsx
import { PSGrid, PSGridItem } from '@/components/ui'

<PSGrid columns={2} spacing="md">
  <PSGridItem span={1}>
    <PSCard><PSText>Item 1</PSText></PSCard>
  </PSGridItem>
  <PSGridItem span={1}>
    <PSCard><PSText>Item 2</PSText></PSCard>
  </PSGridItem>
</PSGrid>
```

### Form Components

#### PSForm
Form container with consistent spacing and validation support.

```tsx
import { PSForm } from '@/components/ui'

<PSForm spacing="comfortable">
  <PSInput placeholder="Name" />
  <PSInput placeholder="Email" />
  <PSButton>Submit</PSButton>
</PSForm>
```

#### PSSelect
Dropdown/select component with custom styling.

```tsx
import { PSSelect } from '@/components/ui'

<PSSelect
  placeholder="Choose an option"
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' }
  ]}
  value={selectedValue}
  onSelect={setSelectedValue}
/>
```

#### PSCheckbox
Checkbox component with custom styling and labels.

```tsx
import { PSCheckbox } from '@/components/ui'

<PSCheckbox
  checked={isChecked}
  onCheckedChange={setIsChecked}
  label="Accept terms and conditions"
  size="medium"
/>
```

#### PSSwitch
Toggle/switch component with size variants.

```tsx
import { PSSwitch } from '@/components/ui'

<PSSwitch
  value={isEnabled}
  onValueChange={setIsEnabled}
  size="medium"
/>
```

### Navigation Components

#### PSHeader
Header component with title, icons, and custom content support.

```tsx
import { PSHeader } from '@/components/ui'

<PSHeader
  title="Page Title"
  leftIcon="chevron-left"
  rightIcon="more"
  onLeftPress={() => navigation.goBack()}
  onRightPress={() => setMenuOpen(true)}
  elevated
/>
```

#### PSTabBar
Tab bar component for bottom navigation.

```tsx
import { PSTabBar } from '@/components/ui'

const tabItems = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'search', label: 'Search', icon: 'search' },
  { key: 'profile', label: 'Profile', icon: 'user' }
]

<PSTabBar
  items={tabItems}
  activeTab={activeTab}
  onTabPress={setActiveTab}
  showLabels
/>
```

#### PSBottomSheet
Modal bottom sheet component with customizable height and content.

```tsx
import { PSBottomSheet } from '@/components/ui'

<PSBottomSheet
  isOpen={isSheetOpen}
  onClose={() => setIsSheetOpen(false)}
  title="Sheet Title"
  maxHeight="half"
>
  <PSText>Bottom sheet content</PSText>
</PSBottomSheet>
```

## 🎯 Usage Patterns

### Theme Integration
All components automatically adapt to light/dark themes:

```tsx
import { PSButton, PSCard } from '@/components/ui'

// Components automatically use theme tokens
<PSCard>
  <PSButton variant="primary">Themed Button</PSButton>
</PSCard>
```

### Composition Example
Building complex UIs with component composition:

```tsx
import { 
  PSContainer, 
  PSHeader, 
  PSCard, 
  PSStack, 
  PSText, 
  PSButton,
  PSInput,
  PSForm 
} from '@/components/ui'

function ProfileScreen() {
  return (
    <PSContainer>
      <PSHeader 
        title="Profile" 
        rightIcon="settings"
        onRightPress={() => navigation.navigate('Settings')}
      />
      
      <PSCard variant="elevated" padding="lg">
        <PSForm spacing="comfortable">
          <PSText variant="h4">Edit Profile</PSText>
          <PSInput placeholder="Full Name" />
          <PSInput placeholder="Email Address" />
          <PSButton variant="primary" fullWidth>
            Save Changes
          </PSButton>
        </PSForm>
      </PSCard>
    </PSContainer>
  )
}
```

## 🧪 Testing

Components include comprehensive test coverage:

```bash
# Run UI component tests
npm run test:client -- --testPathPattern="ui"

# Run specific component tests
npm run test:client -- --testNamePattern="PSButton"
```

## 📱 Accessibility

All components follow accessibility best practices:
- Proper ARIA attributes
- Screen reader support
- Touch target sizing (minimum 44px)
- High contrast color ratios
- Keyboard navigation support

## 🔧 Development

### Adding New Components
1. Create component in appropriate folder (`atoms/`, `layout/`, `forms/`, `navigation/`)
2. Follow naming convention with `PS` prefix
3. Use Tamagui styled components and theme tokens
4. Add TypeScript interfaces
5. Export from respective index files
6. Write comprehensive tests
7. Update documentation

### Theme Customization
Theme tokens are defined in `config/tamagui.config.ts`:

```typescript
// Customize theme tokens
export const customTheme = {
  ...config,
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      primary: '#E14F5A', // Brand color
    }
  }
}
```

## 📚 Resources

- [Tamagui Documentation](https://tamagui.dev/)
- [Design System Guidelines](../../../docs/design_system.md)
- [Component Testing Strategy](../../../docs/testing_strategy.md)
- [Accessibility Guidelines](../../../docs/accessibility.md)